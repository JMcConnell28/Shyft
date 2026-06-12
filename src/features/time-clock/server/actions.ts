import type { PoolClient } from "pg"

import type {
  ClockAction,
  ClockShiftSummary,
  ClockShiftSegment,
  GpsCoordinates,
} from "@/features/time-clock/types"
import {
  getPayableClockIn,
  getPayableClockOut,
  type ClockPayRuleSettings,
  type ScheduledClockWindow,
} from "@/features/time-clock/utils/pay-rules"
import { validateGeofence } from "@/features/time-clock/utils/geofence"
import {
  getActiveEmployeeForLocation,
  getClockTagContext,
  getMatchedPublishedShift,
  listOpenEntries,
} from "@/features/time-clock/server/queries"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { getDatabase } from "@/lib/db"

import {
  assertCurrentUser,
  ensureLocationInScope,
  getRequestAuditFields,
  requireClockManagerScope,
  requireClockSettingsScope,
  withClockTransaction,
} from "@/features/time-clock/server/shared"

type ClockAttemptInput = {
  action: ClockAction
  clockTagId?: string | null
  employeeId?: string | null
  failureReason?: string | null
  gps?: GpsCoordinates | null
  gpsDistanceMeters?: number | null
  locationId?: string | null
  organizationId?: string | null
  performedByUserId: string
  success: boolean
}

type ClockInLocationCheck = {
  distanceMeters: number | null
  locationWarning: string | null
}

type ClockContextRules = ClockPayRuleSettings

async function submitEmployeeClock(input: {
  token: string
  userId: string
  action: ClockAction
  gps?: GpsCoordinates | null
  shiftSegment?: ClockShiftSegment
}) {
  const { session } = await requireVerifiedSessionOrThrow()
  assertCurrentUser(session.user.id, input.userId)

  const context = await getClockTagContext(input.token)
  const employee = await getActiveEmployeeForLocation({
    locationId: context.location_id,
    userId: session.user.id,
  })

  if (input.action === "clock_in") {
    const locationCheck = getClockInLocationCheck({
      gps: input.gps,
      latitude: context.latitude,
      longitude: context.longitude,
      maxAccuracyMeters: context.max_accuracy_meters ?? 150,
      radiusMeters: context.radius_meters ?? 75,
    })

    if (!context.is_enabled) {
      await recordClockAttempt({
        action: input.action,
        clockTagId: context.clock_tag_id,
        employeeId: employee.id,
        failureReason: "Clocking is not enabled for this location.",
        gps: input.gps,
        gpsDistanceMeters: locationCheck.distanceMeters,
        locationId: context.location_id,
        organizationId: context.organization_id,
        performedByUserId: session.user.id,
        success: false,
      })
      throw new Error("Clocking is not enabled for this location.")
    }

    const openEntries = await listOpenEntries({
      employeeId: employee.id,
      locationId: context.location_id,
    })

    if (openEntries.length > 0) {
      const message = "You are already clocked in at this location."
      await recordClockAttempt({
        action: input.action,
        clockTagId: context.clock_tag_id,
        employeeId: employee.id,
        failureReason: message,
        gps: input.gps,
        gpsDistanceMeters: locationCheck.distanceMeters,
        locationId: context.location_id,
        organizationId: context.organization_id,
        performedByUserId: session.user.id,
        success: false,
      })
      throw new Error(message)
    }

    const matchedShift = await getMatchedPublishedShift({
      employeeId: employee.id,
      locationId: context.location_id,
      now: new Date(),
    })
    const shiftSegment = getClockInShiftSegment({
      matchedShift,
      requestedSegment: input.shiftSegment,
    })

    if (matchedShift) {
      await ensureShiftSegmentCanStart({
        employeeId: employee.id,
        rotaPublishedShiftId: matchedShift.id,
        shiftSegment,
      })
    }

    const entry = await withClockTransaction((client) =>
      createClockInEntry(client, {
        employeeId: employee.id,
        locationId: context.location_id,
        rules: getClockContextRules(context),
        organizationId: context.organization_id,
        performedByUserId: session.user.id,
        locationWarning: locationCheck.locationWarning,
        rotaPublishedShiftId: matchedShift?.id ?? null,
        shiftSegment,
        scheduledWindow: getScheduledWindow(matchedShift, shiftSegment),
        source: "employee_nfc",
      }),
    )

    await recordClockAttempt({
      action: input.action,
      clockTagId: context.clock_tag_id,
      employeeId: employee.id,
      failureReason: locationCheck.locationWarning,
      gps: input.gps,
      gpsDistanceMeters: locationCheck.distanceMeters,
      locationId: context.location_id,
      organizationId: context.organization_id,
      performedByUserId: session.user.id,
      success: true,
    })

    return entry
  }

  const openEntries = await listOpenEntries({
    employeeId: employee.id,
    locationId: context.location_id,
  })

  if (openEntries.length !== 1) {
    const message =
      openEntries.length === 0
        ? "You are not currently clocked in at this location."
        : "Your time clock needs manager review before continuing."

    await recordClockAttempt({
      action: input.action,
      clockTagId: context.clock_tag_id,
      employeeId: employee.id,
      failureReason: message,
      gps: input.gps,
      locationId: context.location_id,
      organizationId: context.organization_id,
      performedByUserId: session.user.id,
      success: false,
    })
    throw new Error(message)
  }

  const entry = await withClockTransaction((client) =>
    closeClockEntry(client, {
      employeeId: employee.id,
      entryId: openEntries[0].id,
      eventType: "clock_out",
      performedByUserId: session.user.id,
      reason: null,
      rules: getClockContextRules(context),
    }),
  )

  await recordClockAttempt({
    action: input.action,
    clockTagId: context.clock_tag_id,
    employeeId: employee.id,
    gps: input.gps,
    locationId: context.location_id,
    organizationId: context.organization_id,
    performedByUserId: session.user.id,
    success: true,
  })

  return entry
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
    const rules = await getLocationClockRules(input.locationId)

    return withClockTransaction((client) =>
      createClockInEntry(client, {
        employeeId: employee.id,
        locationId: input.locationId,
        rules,
        organizationId: location.organizationId,
        performedByUserId: scope.userId,
        reason: input.reason,
        rotaPublishedShiftId: matchedShift?.id ?? null,
        scheduledWindow: getScheduledWindow(matchedShift, "full"),
        shiftSegment: "full",
        source: "manager_override",
      }),
    )
  }

  const openEntries = await listOpenEntries({
    employeeId: employee.id,
    locationId: input.locationId,
  })

  if (openEntries.length !== 1) {
    throw new Error(
      openEntries.length === 0
        ? "That team member is not currently clocked in."
        : "That team member has multiple open entries and needs review.",
    )
  }

  const rules = await getLocationClockRules(input.locationId)

  return withClockTransaction((client) =>
    closeClockEntry(client, {
      employeeId: employee.id,
      entryId: openEntries[0].id,
      eventType: "manager_clock_out",
      performedByUserId: scope.userId,
      reason: input.reason,
      rules,
    }),
  )
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
  lateClockOutGraceMinutes: number
  lateFinishReviewMinutes: number
}) {
  const scope = await requireClockSettingsScope(input)
  const location = await ensureLocationInScope(scope, input.locationId)

  if ((input.latitude === null) !== (input.longitude === null)) {
    throw new Error("Set both latitude and longitude, or leave both empty.")
  }

  await getDatabase().query(
    `insert into public.location_clock_settings (
       location_id,
       organization_id,
       is_enabled,
       latitude,
       longitude,
       radius_meters,
       max_accuracy_meters,
       timezone,
       early_clock_in_grace_minutes,
       early_start_review_minutes,
       forgotten_clock_out_alert_minutes,
       hard_review_after_minutes,
       late_clock_out_grace_minutes,
       late_finish_review_minutes
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     on conflict (location_id)
     do update set
       organization_id = excluded.organization_id,
       is_enabled = excluded.is_enabled,
       latitude = excluded.latitude,
       longitude = excluded.longitude,
       radius_meters = excluded.radius_meters,
       max_accuracy_meters = excluded.max_accuracy_meters,
       timezone = excluded.timezone,
       early_clock_in_grace_minutes = excluded.early_clock_in_grace_minutes,
       early_start_review_minutes = excluded.early_start_review_minutes,
       forgotten_clock_out_alert_minutes = excluded.forgotten_clock_out_alert_minutes,
       hard_review_after_minutes = excluded.hard_review_after_minutes,
       late_clock_out_grace_minutes = excluded.late_clock_out_grace_minutes,
       late_finish_review_minutes = excluded.late_finish_review_minutes,
       updated_at = timezone('utc', now())`,
    [
      input.locationId,
      location.organizationId,
      input.isEnabled,
      input.latitude,
      input.longitude,
      input.radiusMeters,
      input.maxAccuracyMeters,
      input.timezone,
      input.earlyClockInGraceMinutes,
      input.earlyStartReviewMinutes,
      input.forgottenClockOutAlertMinutes,
      input.hardReviewAfterMinutes,
      input.lateClockOutGraceMinutes,
      input.lateFinishReviewMinutes,
    ],
  )

  return { success: true as const }
}

async function createClockInEntry(
  client: PoolClient,
  input: {
    employeeId: string
    locationId: string
    rules: ClockPayRuleSettings
    organizationId: string | null
    performedByUserId: string
    reason?: string
    locationWarning?: string | null
    rotaPublishedShiftId: string | null
    scheduledWindow: ScheduledClockWindow | null
    shiftSegment: ClockShiftSegment
    source: "employee_nfc" | "manager_override"
  },
) {
  const actualClockInAt = new Date()
  const payable = getPayableClockIn({
    actualClockInAt,
    rules: input.rules,
    scheduledWindow: input.scheduledWindow,
  })
  const status =
    input.rotaPublishedShiftId && !payable.reviewReason
      ? "open"
      : "requires_review"
  const entryResult = await client.query<{
    clocked_in_at: string
    id: string
    status: "open" | "requires_review"
  }>(
    `insert into public.time_entries (
       organization_id,
       location_id,
       employee_id,
       user_id,
       rota_published_shift_id,
       shift_segment,
       scheduled_start_at,
       scheduled_end_at,
       clocked_in_at,
       payable_start_at,
       status,
       source,
       notes,
       created_by,
       updated_by
     ) values (
       $1,
       $2,
       $3,
       (select user_id from public.employees where id = $3),
       $4,
       $5,
       $6,
       $7,
       $8,
       $9,
       $10,
       $11,
       $12,
       $13,
       $13
     )
     returning id, clocked_in_at::text, status`,
    [
      input.organizationId,
      input.locationId,
      input.employeeId,
      input.rotaPublishedShiftId,
      input.shiftSegment,
      input.scheduledWindow?.startsAt.toISOString() ?? null,
      input.scheduledWindow?.endsAt.toISOString() ?? null,
      actualClockInAt.toISOString(),
      payable.payableStartAt.toISOString(),
      status,
      input.source,
      joinNotes(input.reason, payable.reviewReason, input.locationWarning),
      input.performedByUserId,
    ],
  )
  const entry = entryResult.rows[0]

  if (!entry) {
    throw new Error("We could not clock in right now.")
  }

  await insertClockEvent(client, {
    employeeId: input.employeeId,
    eventType:
      input.source === "manager_override" ? "manager_clock_in" : "clock_in",
    locationId: input.locationId,
    organizationId: input.organizationId,
    performedByUserId: input.performedByUserId,
    reason: input.reason ?? null,
    timeEntryId: entry.id,
  })

  return entry
}

async function closeClockEntry(
  client: PoolClient,
  input: {
    employeeId: string
    entryId: string
    eventType: "clock_out" | "manager_clock_out"
    performedByUserId: string
    reason: string | null
    rules: ClockPayRuleSettings
  },
) {
  const existingResult = await client.query<{
    scheduled_start_at: string | null
    scheduled_end_at: string | null
    status: "open" | "requires_review"
  }>(
    `select scheduled_start_at::text,
            scheduled_end_at::text,
            status
     from public.time_entries
     where id = $1::uuid
       and clocked_out_at is null
     for update`,
    [input.entryId],
  )
  const existingEntry = existingResult.rows[0]

  if (!existingEntry) {
    throw new Error("We could not clock out right now.")
  }

  const actualClockOutAt = new Date()
  const scheduledWindow =
    existingEntry.scheduled_start_at && existingEntry.scheduled_end_at
      ? {
          startsAt: new Date(existingEntry.scheduled_start_at),
          endsAt: new Date(existingEntry.scheduled_end_at),
        }
      : null
  const payable = getPayableClockOut({
    actualClockOutAt,
    rules: input.rules,
    scheduledWindow,
  })
  const entryResult = await client.query<{
    clocked_out_at: string
    id: string
    location_id: string
    organization_id: string | null
    status: "closed" | "requires_review"
  }>(
    `update public.time_entries
     set clocked_out_at = $3::timestamptz,
         payable_end_at = $4::timestamptz,
         status = case
           when status = 'requires_review' or $5::text is not null then 'requires_review'
           else 'closed'
         end,
         notes = case
           when $5::text is null then notes
           when notes is null or notes = '' then $5::text
           else notes || E'\n' || $5::text
         end,
         updated_by = $2,
         updated_at = timezone('utc', now())
     where id = $1::uuid
       and clocked_out_at is null
     returning id, location_id, organization_id, clocked_out_at::text, status`,
    [
      input.entryId,
      input.performedByUserId,
      actualClockOutAt.toISOString(),
      payable.payableEndAt.toISOString(),
      payable.reviewReason,
    ],
  )
  const entry = entryResult.rows[0]

  if (!entry) {
    throw new Error("We could not clock out right now.")
  }

  await insertClockEvent(client, {
    employeeId: input.employeeId,
    eventType: input.eventType,
    locationId: entry.location_id,
    organizationId: entry.organization_id,
    performedByUserId: input.performedByUserId,
    reason: input.reason,
    timeEntryId: entry.id,
  })

  return entry
}

async function insertClockEvent(
  client: PoolClient,
  input: {
    employeeId: string
    eventType:
      | "clock_in"
      | "clock_out"
      | "manager_clock_in"
      | "manager_clock_out"
    locationId: string
    organizationId: string | null
    performedByUserId: string
    reason: string | null
    timeEntryId: string
  },
) {
  await client.query(
    `insert into public.clock_events (
       time_entry_id,
       organization_id,
       location_id,
       employee_id,
       performed_by_user_id,
       event_type,
       reason
     ) values ($1, $2, $3, $4, $5, $6, $7)`,
    [
      input.timeEntryId,
      input.organizationId,
      input.locationId,
      input.employeeId,
      input.performedByUserId,
      input.eventType,
      input.reason,
    ],
  )
}

async function recordClockAttempt(input: ClockAttemptInput) {
  const audit = getRequestAuditFields()

  await getDatabase().query(
    `insert into public.clock_attempts (
       organization_id,
       location_id,
       clock_tag_id,
       employee_id,
       performed_by_user_id,
       action,
       success,
       failure_reason,
       gps_latitude,
       gps_longitude,
       gps_accuracy_meters,
       gps_distance_meters,
       ip_hash,
       user_agent
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      input.organizationId ?? null,
      input.locationId ?? null,
      input.clockTagId ?? null,
      input.employeeId ?? null,
      input.performedByUserId,
      input.action,
      input.success,
      input.failureReason ?? null,
      input.gps?.latitude ?? null,
      input.gps?.longitude ?? null,
      input.gps?.accuracyMeters ?? null,
      input.gpsDistanceMeters ?? null,
      audit.ipHash,
      audit.userAgent,
    ],
  )
}

function getClockInLocationCheck(input: {
  gps?: GpsCoordinates | null
  latitude: number | null
  longitude: number | null
  maxAccuracyMeters: number
  radiusMeters: number
}): ClockInLocationCheck {
  if (!input.gps) {
    return {
      distanceMeters: null,
      locationWarning: "Browser location was not available during clock-in.",
    }
  }

  const geofence = validateGeofence(
    {
      latitude: input.latitude,
      longitude: input.longitude,
      radiusMeters: input.radiusMeters,
      maxAccuracyMeters: input.maxAccuracyMeters,
    },
    input.gps,
  )

  if (geofence.success) {
    return {
      distanceMeters: geofence.distanceMeters,
      locationWarning: null,
    }
  }

  return {
    distanceMeters: geofence.distanceMeters,
    locationWarning: geofence.reason,
  }
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

async function ensureShiftSegmentCanStart(input: {
  employeeId: string
  rotaPublishedShiftId: string
  shiftSegment: ClockShiftSegment
}) {
  const result = await getDatabase().query<{
    clocked_out_at: string | null
    shift_segment: ClockShiftSegment
  }>(
    `select shift_segment, clocked_out_at::text
     from public.time_entries
     where employee_id = $1::uuid
       and rota_published_shift_id = $2::uuid`,
    [
      input.employeeId,
      input.rotaPublishedShiftId,
    ],
  )
  const entries = result.rows

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
      (entry) => entry.shift_segment === "split_first",
    )

    if (!firstHalf?.clocked_out_at) {
      throw new Error("Finish the first half before starting the second half.")
    }
  }
}

function getClockContextRules(
  context: {
    early_clock_in_grace_minutes?: number | null
    early_start_review_minutes?: number | null
    forgotten_clock_out_alert_minutes?: number | null
    hard_review_after_minutes?: number | null
    late_clock_out_grace_minutes?: number | null
    late_finish_review_minutes?: number | null
  },
): ClockContextRules {
  return {
    earlyClockInGraceMinutes:
      context.early_clock_in_grace_minutes ?? 10,
    earlyStartReviewMinutes: context.early_start_review_minutes ?? 15,
    forgottenClockOutAlertMinutes:
      context.forgotten_clock_out_alert_minutes ?? 120,
    hardReviewAfterMinutes: context.hard_review_after_minutes ?? 720,
    lateClockOutGraceMinutes:
      context.late_clock_out_grace_minutes ?? 10,
    lateFinishReviewMinutes: context.late_finish_review_minutes ?? 15,
  }
}

async function getLocationClockRules(locationId: string) {
  const result = await getDatabase().query<{
    early_clock_in_grace_minutes: number
    early_start_review_minutes: number
    forgotten_clock_out_alert_minutes: number
    hard_review_after_minutes: number
    late_clock_out_grace_minutes: number
    late_finish_review_minutes: number
  }>(
    `select early_clock_in_grace_minutes,
            early_start_review_minutes,
            forgotten_clock_out_alert_minutes,
            hard_review_after_minutes,
            late_clock_out_grace_minutes,
            late_finish_review_minutes
     from public.location_clock_settings
     where location_id = $1::uuid
     limit 1`,
    [locationId],
  )

  return getClockContextRules(result.rows[0] ?? {})
}

function getScheduledWindow(
  matchedShift: ClockShiftSummary | null,
  shiftSegment: ClockShiftSegment,
): ScheduledClockWindow | null {
  const segment = matchedShift?.segments.find(
    (candidate) => candidate.key === shiftSegment,
  )

  if (!segment) {
    return null
  }

  return {
    startsAt: new Date(segment.startsAt),
    endsAt: new Date(segment.endsAt),
  }
}

function joinNotes(...values: Array<string | null | undefined>) {
  const notes = values.filter((value): value is string =>
    Boolean(value?.trim()),
  )

  return notes.length > 0 ? notes.join("\n") : null
}

async function getEmployeeForOverride(input: {
  employeeId: string
  locationId: string
}) {
  const result = await getDatabase().query<{ id: string }>(
    `select employee.id
     from public.employees employee
     join public.employee_location_assignments assignment
       on assignment.employee_id = employee.id
     where employee.id = $1::uuid
       and employee.status = 'active'
       and assignment.location_id = $2::uuid
       and assignment.is_enabled = true
       and assignment.disabled_at is null
     limit 1`,
    [input.employeeId, input.locationId],
  )
  const employee = result.rows[0]

  if (!employee) {
    throw new Error("That active team member is not assigned to this location.")
  }

  return employee
}

export {
  managerClockOverride,
  submitEmployeeClock,
  updateClockSettings,
}
