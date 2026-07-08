import "@tanstack/react-start/server-only"

import type {
  ClockAction,
  ClockReason,
  ClockShiftSummary,
  ClockShiftSegment,
} from "@/features/time-clock/types"
import {
  getPayableClockIn,
  getPayableClockOut,
  type ClockPayRuleSettings,
  type ScheduledClockWindow,
} from "@/features/time-clock/utils/pay-rules"
import {
  getEmployeeClockPageData,
  getMatchedPublishedShift,
  listOpenEntries,
} from "@/features/time-clock/server/queries"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { requireTimeAttendanceAccess } from "@/features/billing/server/entitlements"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import {
  assertSupabaseSuccess,
  getRequiredSupabaseRow,
} from "@/lib/supabase-errors"

import {
  assertCurrentUser,
  ensureLocationInScope,
  getRequestAuditFields,
  requireClockManagerScope,
  requireClockSettingsScope,
} from "@/features/time-clock/server/shared"

type ClockEntryWrite = {
  clocked_in_at?: string
  clocked_out_at?: string | null
  id: string
  status: "closed" | "open" | "requires_review"
}

const reasonLabels: Record<ClockReason, string> = {
  asked_early: "Asked to come in early",
  asked_late: "Asked to come in late",
  covering_shift: "Covering a shift",
  manager_approved: "Manager approved",
  other: "Other",
  transport_delay: "Transport delay",
}

async function submitEmployeeClock(input: {
  scanSessionId: string
  userId: string
  action: ClockAction
  earlyClockInMode?: "scheduled" | "now"
  reason?: ClockReason
  shiftSegment?: ClockShiftSegment
}) {
  const { session } = await requireVerifiedSessionOrThrow()
  assertCurrentUser(session.user.id, input.userId)

  const page = await getEmployeeClockPageData({
    scanSessionId: input.scanSessionId,
    userId: session.user.id,
  })
  await requireTimeAttendanceAccess(page.location.id)

  if (page.nextAction !== input.action) {
    throw new Error("Tap the clock tag again before continuing.")
  }

  if (!page.isClockingEnabled && !page.openEntry) {
    throw new Error("Clocking is not enabled for this location.")
  }

  const rules = await getLocationClockRules(page.location.id)
  const now = new Date()

  if (input.action === "clock_in") {
    const shiftSegment = getClockInShiftSegment({
      matchedShift: page.matchedShift,
      requestedSegment: input.shiftSegment,
    })

    await ensureShiftSegmentCanStart({
      employeeId: page.employee.id,
      rotaPublishedShiftId: page.matchedShift?.id ?? null,
      shiftSegment,
    })

    const scheduledWindow = getScheduledWindow(page.matchedShift, shiftSegment)
    const clockInPlan = getClockInPlan({
      actualClockInAt: now,
      earlyClockInMode: input.earlyClockInMode,
      reason: input.reason,
      rules,
      scheduledWindow,
    })

    return recordEmployeeClockFromScan({
      action: input.action,
      clockedInAt: now,
      clockedOutAt: null,
      notes: clockInPlan.notes,
      payableEndAt: null,
      payableStartAt: clockInPlan.payableStartAt,
      rotaPublishedShiftId: page.matchedShift?.id ?? null,
      scanSessionId: input.scanSessionId,
      scheduledWindow,
      shiftSegment,
      status: clockInPlan.status,
      userId: session.user.id,
    })
  }

  if (!page.openEntry) {
    throw new Error("You are not currently clocked in at this location.")
  }

  const scheduledWindow =
    page.openEntry.scheduledStartAt && page.openEntry.scheduledEndAt
      ? {
          startsAt: new Date(page.openEntry.scheduledStartAt),
          endsAt: new Date(page.openEntry.scheduledEndAt),
        }
      : null
  const payable = getPayableClockOut({
    actualClockOutAt: now,
    rules,
    scheduledWindow,
  })
  const nextStatus =
    page.openEntry.status === "requires_review" || payable.reviewReason
      ? "requires_review"
      : "closed"

  return recordEmployeeClockFromScan({
    action: input.action,
    clockedInAt: null,
    clockedOutAt: now,
    notes: joinNotes(payable.reviewReason),
    payableEndAt: payable.payableEndAt,
    payableStartAt: null,
    rotaPublishedShiftId: null,
    scanSessionId: input.scanSessionId,
    scheduledWindow,
    shiftSegment: page.openEntry.shiftSegment,
    status: nextStatus,
    userId: session.user.id,
  })
}

async function managerClockOverride(input: {
  organizationId?: string
  locationId: string
  userId: string
  employeeId: string
  action: ClockAction
  reason: string
}) {
  const scope = await requireClockManagerScope(input)
  const location = await ensureLocationInScope(scope, input.locationId)
  const employee = await getEmployeeForOverride({
    employeeId: input.employeeId,
    locationId: input.locationId,
  })

  if (input.action === "clock_in") {
    const openEntries = await listOpenEntries({
      employeeId: employee.id,
      locationId: input.locationId,
    })

    if (openEntries.length > 0) {
      throw new Error("That team member is already clocked in.")
    }

    const matchedShift = await getMatchedPublishedShift({
      employeeId: employee.id,
      locationId: input.locationId,
      now: new Date(),
    })
    const scheduledWindow = getScheduledWindow(matchedShift, "full")
    const now = new Date()
    const rules = await getLocationClockRules(input.locationId)
    const payable = getPayableClockIn({
      actualClockInAt: now,
      rules,
      scheduledWindow,
    })
    const entry = await insertTimeEntry({
      employeeId: employee.id,
      locationId: input.locationId,
      notes: joinNotes(input.reason, payable.reviewReason),
      organizationId: location.organizationId,
      payableStartAt: payable.payableStartAt,
      performedByUserId: scope.userId,
      rotaPublishedShiftId: matchedShift?.id ?? null,
      scheduledWindow,
      shiftSegment: "full",
      source: "manager_override",
      status: payable.reviewReason ? "requires_review" : "open",
    })

    await insertClockEvent({
      employeeId: employee.id,
      eventType: "manager_clock_in",
      locationId: input.locationId,
      organizationId: location.organizationId,
      performedByUserId: scope.userId,
      reason: input.reason,
      timeEntryId: entry.id,
    })

    return entry
  }

  const openEntries = await listOpenEntries({
    employeeId: employee.id,
    locationId: input.locationId,
  })

  if (openEntries.length !== 1) {
    throw new Error(
      openEntries.length === 0
        ? "That team member is not currently clocked in."
        : "That team member has multiple open entries and needs review."
    )
  }

  const rules = await getLocationClockRules(input.locationId)
  const scheduledWindow =
    openEntries[0].scheduled_start_at && openEntries[0].scheduled_end_at
      ? {
          startsAt: new Date(openEntries[0].scheduled_start_at),
          endsAt: new Date(openEntries[0].scheduled_end_at),
        }
      : null
  const now = new Date()
  const payable = getPayableClockOut({
    actualClockOutAt: now,
    rules,
    scheduledWindow,
  })
  const status =
    openEntries[0].status === "requires_review" || payable.reviewReason
      ? "requires_review"
      : "closed"
  const entry = await updateTimeEntryForClockOut({
    entryId: openEntries[0].id,
    notes: joinNotes(input.reason, payable.reviewReason),
    payableEndAt: payable.payableEndAt,
    performedByUserId: scope.userId,
    status,
  })

  await insertClockEvent({
    employeeId: employee.id,
    eventType: "manager_clock_out",
    locationId: input.locationId,
    organizationId: location.organizationId,
    performedByUserId: scope.userId,
    reason: input.reason,
    timeEntryId: entry.id,
  })

  return entry
}

async function updateClockSettings(input: {
  organizationId?: string
  locationId: string
  userId: string
  isEnabled: boolean
  latitude: number | null
  longitude: number | null
  radiusMeters: number
  maxAccuracyMeters: number
  timezone: string
  earlyClockInGraceMinutes: number
  earlyStartReviewMinutes: number
  forgottenClockOutAlertMinutes: number
  hardReviewAfterMinutes: number
  lateClockInGraceMinutes: number
  lateStartReviewMinutes: number
  lateClockOutGraceMinutes: number
  lateFinishReviewMinutes: number
}) {
  const scope = await requireClockSettingsScope(input)
  const location = await ensureLocationInScope(scope, input.locationId)

  if ((input.latitude === null) !== (input.longitude === null)) {
    throw new Error("Set both latitude and longitude, or leave both empty.")
  }

  const supabase = createSupabaseServerClient()
  const result = await supabase.from("location_clock_settings").upsert(
    {
      early_clock_in_grace_minutes: input.earlyClockInGraceMinutes,
      early_start_review_minutes: input.earlyStartReviewMinutes,
      forgotten_clock_out_alert_minutes: input.forgottenClockOutAlertMinutes,
      hard_review_after_minutes: input.hardReviewAfterMinutes,
      is_enabled: input.isEnabled,
      late_clock_in_grace_minutes: input.lateClockInGraceMinutes,
      late_clock_out_grace_minutes: input.lateClockOutGraceMinutes,
      late_finish_review_minutes: input.lateFinishReviewMinutes,
      late_start_review_minutes: input.lateStartReviewMinutes,
      latitude: input.latitude,
      location_id: input.locationId,
      longitude: input.longitude,
      max_accuracy_meters: input.maxAccuracyMeters,
      organization_id: location.organizationId,
      radius_meters: input.radiusMeters,
      timezone: input.timezone,
    },
    { onConflict: "location_id" }
  )

  assertSupabaseSuccess(result.error, "We could not save clock settings.")
  return { success: true as const }
}

async function approveTimeEntryAsRecorded(input: {
  organizationId?: string
  locationId?: string
  userId: string
  entryId: string
}) {
  const scope = await requireClockManagerScope(input)
  const supabase = createSupabaseServerClient()
  const result = await supabase.rpc("approve_time_entry_as_recorded", {
    p_entry_id: input.entryId,
    p_user_id: scope.userId,
  })

  assertSupabaseSuccess(result.error, "We could not approve that time entry.")
  return result.data
}

async function recordEmployeeClockFromScan(input: {
  action: ClockAction
  clockedInAt: Date | null
  clockedOutAt: Date | null
  notes: string | null
  payableEndAt: Date | null
  payableStartAt: Date | null
  rotaPublishedShiftId: string | null
  scanSessionId: string
  scheduledWindow: ScheduledClockWindow | null
  shiftSegment: ClockShiftSegment
  status: "closed" | "open" | "requires_review"
  userId: string
}) {
  const audit = getRequestAuditFields()
  const supabase = createSupabaseServerClient()
  const result = await supabase.rpc("record_employee_clock_from_scan", {
    p_action: input.action,
    p_clocked_in_at: input.clockedInAt?.toISOString() ?? null,
    p_clocked_out_at: input.clockedOutAt?.toISOString() ?? null,
    p_gps_accuracy_meters: null,
    p_gps_distance_meters: null,
    p_gps_latitude: null,
    p_gps_longitude: null,
    p_ip_hash: audit.ipHash,
    p_notes: input.notes,
    p_payable_end_at: input.payableEndAt?.toISOString() ?? null,
    p_payable_start_at: input.payableStartAt?.toISOString() ?? null,
    p_rota_published_shift_id: input.rotaPublishedShiftId,
    p_scan_session_id: input.scanSessionId,
    p_scheduled_end_at: input.scheduledWindow?.endsAt.toISOString() ?? null,
    p_scheduled_start_at: input.scheduledWindow?.startsAt.toISOString() ?? null,
    p_shift_segment: input.shiftSegment,
    p_status: input.status,
    p_user_agent: audit.userAgent,
    p_user_id: input.userId,
  })

  assertSupabaseSuccess(result.error, "We could not update your clock status.")
  return result.data as ClockEntryWrite
}

function getClockInPlan(input: {
  actualClockInAt: Date
  earlyClockInMode?: "scheduled" | "now"
  reason?: ClockReason
  rules: ClockPayRuleSettings
  scheduledWindow: ScheduledClockWindow | null
}) {
  if (!input.scheduledWindow) {
    requireReason(input.reason, "Choose a reason for this clock-in.")
    return {
      notes: joinNotes(
        "Clock-in did not match a published shift.",
        getReasonNote(input.reason)
      ),
      payableStartAt: input.actualClockInAt,
      status: "requires_review" as const,
    }
  }

  const diffMinutes =
    (input.actualClockInAt.getTime() -
      input.scheduledWindow.startsAt.getTime()) /
    (60 * 1000)

  if (diffMinutes < -input.rules.earlyClockInGraceMinutes) {
    if (input.earlyClockInMode === "now") {
      requireReason(input.reason, "Choose a reason for starting early.")
      return {
        notes: joinNotes(
          `Started ${Math.round(Math.abs(diffMinutes))} minutes early.`,
          getReasonNote(input.reason)
        ),
        payableStartAt: input.actualClockInAt,
        status: "requires_review" as const,
      }
    }

    return {
      notes: joinNotes(
        "Clocked in early; payable time starts at the scheduled start."
      ),
      payableStartAt: input.scheduledWindow.startsAt,
      status: "open" as const,
    }
  }

  if (diffMinutes > 0 && diffMinutes > input.rules.lateClockInGraceMinutes) {
    requireReason(input.reason, "Choose a reason for clocking in late.")
    return {
      notes: joinNotes(
        `Clocked in ${Math.round(diffMinutes)} minutes after scheduled start.`,
        getReasonNote(input.reason)
      ),
      payableStartAt: input.actualClockInAt,
      status: "requires_review" as const,
    }
  }

  const payable = getPayableClockIn({
    actualClockInAt: input.actualClockInAt,
    rules: input.rules,
    scheduledWindow: input.scheduledWindow,
  })

  return {
    notes: joinNotes(payable.reviewReason),
    payableStartAt: payable.payableStartAt,
    status: payable.reviewReason
      ? ("requires_review" as const)
      : ("open" as const),
  }
}

async function insertTimeEntry(input: {
  employeeId: string
  locationId: string
  notes: string | null
  organizationId: string | null
  payableStartAt: Date
  performedByUserId: string
  rotaPublishedShiftId: string | null
  scheduledWindow: ScheduledClockWindow | null
  shiftSegment: ClockShiftSegment
  source: "employee_nfc" | "manager_override"
  status: "open" | "requires_review"
}) {
  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("time_entries")
    .insert({
      clocked_in_at: new Date().toISOString(),
      created_by: input.performedByUserId,
      employee_id: input.employeeId,
      location_id: input.locationId,
      notes: input.notes,
      organization_id: input.organizationId,
      payable_start_at: input.payableStartAt.toISOString(),
      rota_published_shift_id: input.rotaPublishedShiftId,
      scheduled_end_at: input.scheduledWindow?.endsAt.toISOString() ?? null,
      scheduled_start_at: input.scheduledWindow?.startsAt.toISOString() ?? null,
      shift_segment: input.shiftSegment,
      source: input.source,
      status: input.status,
      updated_by: input.performedByUserId,
      user_id: input.performedByUserId,
    })
    .select("id, clocked_in_at, status")
    .single()

  assertSupabaseSuccess(result.error, "We could not clock in right now.")
  return getRequiredSupabaseRow(result.data, "We could not clock in right now.")
}

async function updateTimeEntryForClockOut(input: {
  entryId: string
  notes: string | null
  payableEndAt: Date
  performedByUserId: string
  status: "closed" | "requires_review"
}) {
  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("time_entries")
    .update({
      clocked_out_at: new Date().toISOString(),
      notes: input.notes,
      payable_end_at: input.payableEndAt.toISOString(),
      status: input.status,
      updated_by: input.performedByUserId,
    })
    .eq("id", input.entryId)
    .is("clocked_out_at", null)
    .select("id, clocked_out_at, status")
    .single()

  assertSupabaseSuccess(result.error, "We could not clock out right now.")
  return getRequiredSupabaseRow(
    result.data,
    "We could not clock out right now."
  )
}

async function insertClockEvent(input: {
  employeeId: string
  eventType: "manager_clock_in" | "manager_clock_out"
  locationId: string
  organizationId: string | null
  performedByUserId: string
  reason: string | null
  timeEntryId: string
}) {
  const supabase = createSupabaseServerClient()
  const result = await supabase.from("clock_events").insert({
    employee_id: input.employeeId,
    event_type: input.eventType,
    location_id: input.locationId,
    organization_id: input.organizationId,
    performed_by_user_id: input.performedByUserId,
    reason: input.reason,
    time_entry_id: input.timeEntryId,
  })

  assertSupabaseSuccess(result.error, "We could not record the clock event.")
}

async function ensureShiftSegmentCanStart(input: {
  employeeId: string
  rotaPublishedShiftId: string | null
  shiftSegment: ClockShiftSegment
}) {
  if (!input.rotaPublishedShiftId) {
    return
  }

  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("time_entries")
    .select("shift_segment, clocked_out_at")
    .eq("employee_id", input.employeeId)
    .eq("rota_published_shift_id", input.rotaPublishedShiftId)

  assertSupabaseSuccess(result.error, "We could not check that shift.")
  const entries = result.data ?? []

  if (entries.some((entry) => entry.shift_segment === input.shiftSegment)) {
    throw new Error("That part of this shift has already been clocked.")
  }

  if (
    input.shiftSegment === "split_first" &&
    entries.some((entry) => entry.shift_segment === "split_second")
  ) {
    throw new Error("The first half can no longer be started.")
  }

  if (input.shiftSegment === "split_second") {
    const firstHalf = entries.find(
      (entry) => entry.shift_segment === "split_first"
    )

    if (!firstHalf?.clocked_out_at) {
      throw new Error("Finish the first half before starting the second half.")
    }
  }
}

async function getLocationClockRules(
  locationId: string
): Promise<ClockPayRuleSettings> {
  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("location_clock_settings")
    .select(
      "early_clock_in_grace_minutes, early_start_review_minutes, forgotten_clock_out_alert_minutes, hard_review_after_minutes, late_clock_in_grace_minutes, late_clock_out_grace_minutes, late_finish_review_minutes, late_start_review_minutes"
    )
    .eq("location_id", locationId)
    .maybeSingle()

  assertSupabaseSuccess(result.error, "We could not load clock settings.")

  return {
    earlyClockInGraceMinutes: result.data?.early_clock_in_grace_minutes ?? 10,
    earlyStartReviewMinutes: result.data?.early_start_review_minutes ?? 15,
    forgottenClockOutAlertMinutes:
      result.data?.forgotten_clock_out_alert_minutes ?? 120,
    hardReviewAfterMinutes: result.data?.hard_review_after_minutes ?? 720,
    lateClockInGraceMinutes: result.data?.late_clock_in_grace_minutes ?? 5,
    lateClockOutGraceMinutes: result.data?.late_clock_out_grace_minutes ?? 10,
    lateFinishReviewMinutes: result.data?.late_finish_review_minutes ?? 15,
    lateStartReviewMinutes: result.data?.late_start_review_minutes ?? 15,
  }
}

async function getEmployeeForOverride(input: {
  employeeId: string
  locationId: string
}) {
  const supabase = createSupabaseServerClient()
  const assignmentResult = await supabase
    .from("employee_location_assignments")
    .select("employee_id")
    .eq("employee_id", input.employeeId)
    .eq("location_id", input.locationId)
    .eq("is_enabled", true)
    .is("disabled_at", null)
    .maybeSingle()

  assertSupabaseSuccess(
    assignmentResult.error,
    "We could not load that team member."
  )

  if (!assignmentResult.data) {
    throw new Error("That active team member is not assigned to this location.")
  }

  const employeeResult = await supabase
    .from("employees")
    .select("id")
    .eq("id", input.employeeId)
    .eq("status", "active")
    .maybeSingle()

  assertSupabaseSuccess(
    employeeResult.error,
    "We could not load that team member."
  )
  return getRequiredSupabaseRow(
    employeeResult.data,
    "That active team member is not assigned to this location."
  )
}

function getClockInShiftSegment(input: {
  matchedShift: { shiftType: string } | null
  requestedSegment?: ClockShiftSegment
}): ClockShiftSegment {
  if (input.matchedShift?.shiftType !== "split") {
    return "full"
  }

  if (
    input.requestedSegment === "split_first" ||
    input.requestedSegment === "split_second"
  ) {
    return input.requestedSegment
  }

  throw new Error("Choose which half of your split shift you are starting.")
}

function getScheduledWindow(
  matchedShift: ClockShiftSummary | null,
  shiftSegment: ClockShiftSegment
): ScheduledClockWindow | null {
  const segment = matchedShift?.segments.find(
    (candidate) => candidate.key === shiftSegment
  )

  if (!segment) {
    return null
  }

  return {
    startsAt: new Date(segment.startsAt),
    endsAt: new Date(segment.endsAt),
  }
}

function requireReason(reason: ClockReason | undefined, message: string) {
  if (!reason) {
    throw new Error(message)
  }
}

function getReasonNote(reason: ClockReason | undefined) {
  return reason ? `Reason: ${reasonLabels[reason]}` : null
}

function joinNotes(...values: Array<string | null | undefined>) {
  const notes = values.filter((value): value is string =>
    Boolean(value?.trim())
  )

  return notes.length > 0 ? notes.join("\n") : null
}

export {
  approveTimeEntryAsRecorded,
  managerClockOverride,
  submitEmployeeClock,
  updateClockSettings,
}
