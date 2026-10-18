import "@tanstack/react-start/server-only"

import { getLocationClockSettings } from "./clock-settings"
import {
  ensureShiftSegmentCanStart,
  getClockInShiftSegment,
  getScheduledWindow,
} from "./shift-segments"
import type {
  ClockAction,
  ClockReason,
  ClockShiftSegment,
} from "@/features/time-clock/types"
import type {
  ClockPayRuleSettings,
  ScheduledClockWindow,
} from "@/features/time-clock/utils/pay-rules"
// eslint-disable-next-line no-duplicate-imports
import {
  getPayableClockIn,
  getPayableClockOut,
} from "@/features/time-clock/utils/pay-rules"
import { getEmployeeClockPageData } from "@/features/time-clock/server/queries"
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
} from "@/features/time-clock/server/shared"

import { joinNotes } from "@/features/time-clock/utils/join-notes"

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

  const { rules } = await getLocationClockSettings(page.location.id)
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

async function approveTimeEntryAsRecorded(input: {
  organizationId?: string
  locationId?: string
  userId: string
  entryId: string
}) {
  const scope = await requireClockManagerScope(input)
  const supabase = createSupabaseServerClient()
  const entryResult = await supabase
    .from("time_entries")
    .select("location_id")
    .eq("id", input.entryId)
    .single()
  assertSupabaseSuccess(entryResult.error, "We could not load that time entry.")
  const entry = getRequiredSupabaseRow(
    entryResult.data,
    "We could not load that time entry."
  )
  await ensureLocationInScope(scope, entry.location_id)
  await requireTimeAttendanceAccess(entry.location_id)
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

function requireReason(reason: ClockReason | undefined, message: string) {
  if (!reason) {
    throw new Error(message)
  }
}

function getReasonNote(reason: ClockReason | undefined) {
  return reason ? `Reason: ${reasonLabels[reason]}` : null
}

export { approveTimeEntryAsRecorded, submitEmployeeClock }

export { managerClockOverride } from "./manager-clock-override"

export { updateClockSettings } from "./update-clock-settings"
