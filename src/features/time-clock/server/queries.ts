import { format } from "date-fns"

import type {
  ClockShiftSegment,
  ClockSettingsPageData,
  EmployeeClockPageData,
  ManagerClockPageData,
} from "@/features/time-clock/types"
import {
  findBestShiftMatch,
  formatShiftDate,
  type PublishedShiftCandidate,
} from "@/features/time-clock/utils/shift-matching"
import { isPastForgottenClockOutAlert } from "@/features/time-clock/utils/pay-rules"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { getDatabase } from "@/lib/db"

import {
  assertCurrentUser,
  hashClockToken,
  listManagedClockLocations,
  requireClockManagerScope,
  requireClockSettingsScope,
} from "@/features/time-clock/server/shared"

type ClockTagContextRow = {
  clock_tag_id: string | null
  clock_label: string
  location_id: string
  location_name: string
  organization_id: string | null
  is_enabled: boolean | null
  latitude: number | null
  longitude: number | null
  radius_meters: number | null
  max_accuracy_meters: number | null
  timezone: string | null
  early_clock_in_grace_minutes: number | null
  early_start_review_minutes: number | null
  forgotten_clock_out_alert_minutes: number | null
  hard_review_after_minutes: number | null
  late_clock_out_grace_minutes: number | null
  late_finish_review_minutes: number | null
}

type EmployeeRow = {
  id: string
  full_name: string
}

type OpenEntryRow = {
  id: string
  clocked_in_at: string
  shift_segment: ClockShiftSegment
  status: "open" | "closed" | "requires_review"
}

async function getEmployeeClockPageData(input: {
  token: string
  userId: string
}): Promise<EmployeeClockPageData> {
  const { session } = await requireVerifiedSessionOrThrow()
  assertCurrentUser(session.user.id, input.userId)

  const context = await getClockTagContext(input.token)
  const employee = await getActiveEmployeeForLocation({
    locationId: context.location_id,
    userId: session.user.id,
  })
  const openEntries = await listOpenEntries({
    employeeId: employee.id,
    locationId: context.location_id,
  })

  if (openEntries.length > 1) {
    throw new Error("Your time clock needs manager review before continuing.")
  }

  const matchedShift = await getMatchedPublishedShift({
    employeeId: employee.id,
    locationId: context.location_id,
    now: new Date(),
  })
  const completedShiftSegments = matchedShift
    ? await listCompletedShiftSegments({
        employeeId: employee.id,
        rotaPublishedShiftId: matchedShift.id,
      })
    : []
  const isClockingEnabled = Boolean(context.is_enabled) || Boolean(openEntries[0])

  return {
    clockLabel: context.clock_label,
    location: {
      id: context.location_id,
      name: context.location_name,
      latitude: context.latitude,
      longitude: context.longitude,
      radiusMeters: context.radius_meters ?? 75,
      maxAccuracyMeters: context.max_accuracy_meters ?? 150,
    },
    employee: {
      id: employee.id,
      name: employee.full_name,
    },
    completedShiftSegments,
    openEntry: openEntries[0]
      ? {
          id: openEntries[0].id,
          clockedInAt: openEntries[0].clocked_in_at,
          shiftSegment: openEntries[0].shift_segment,
          status: openEntries[0].status,
        }
      : null,
    matchedShift,
    nextAction: openEntries[0] ? "clock_out" : "clock_in",
    isClockingEnabled,
    setupMessage: getClockSetupMessage({
      isEnabled: Boolean(context.is_enabled),
      hasOpenEntry: Boolean(openEntries[0]),
    }),
  }
}

async function getManagerClockPageData(input: {
  organizationId?: string
  locationId?: string
  userId: string
}): Promise<ManagerClockPageData> {
  const scope = await requireClockManagerScope(input)
  const locations = await listManagedClockLocations(scope)
  const locationIds = locations.map((location) => location.id)

  if (locationIds.length === 0) {
    return {
      locations: [],
      employees: [],
      failedAttempts: [],
      reviewEntries: [],
    }
  }

  const [employeesResult, attemptsResult, reviewEntriesResult] =
    await Promise.all([
      getDatabase().query<{
        clocked_in_at: string | null
        email: string | null
        employee_id: string
        full_name: string
        location_id: string
        location_name: string
        open_entry_id: string | null
        scheduled_end_at: string | null
        source: "employee_nfc" | "manager_override" | "adjustment" | null
        status: "open" | "closed" | "requires_review" | null
        employee_status: string
        forgotten_clock_out_alert_minutes: number | null
        hard_review_after_minutes: number | null
      }>(
        `select distinct on (employee.id, assignment.location_id)
           employee.id as employee_id,
           employee.full_name,
           employee.email,
           employee.status as employee_status,
           assignment.location_id,
           location.name as location_name,
           entry.id as open_entry_id,
           entry.clocked_in_at::text,
           entry.scheduled_end_at::text,
           entry.status,
           entry.source,
           settings.forgotten_clock_out_alert_minutes,
           settings.hard_review_after_minutes
         from public.employee_location_assignments assignment
         join public.employees employee on employee.id = assignment.employee_id
         join public.locations location on location.id = assignment.location_id
         left join public.location_clock_settings settings
           on settings.location_id = assignment.location_id
         left join public.time_entries entry
           on entry.employee_id = employee.id
          and entry.location_id = assignment.location_id
          and entry.clocked_out_at is null
         where assignment.location_id = any($1::uuid[])
           and assignment.is_enabled = true
           and assignment.disabled_at is null
         order by employee.id, assignment.location_id, employee.full_name asc`,
        [locationIds],
      ),
      getDatabase().query<{
        action: "clock_in" | "clock_out" | null
        created_at: string
        employee_name: string | null
        failure_reason: string | null
        gps_accuracy_meters: number | null
        gps_distance_meters: number | null
        id: string
      }>(
        `select attempt.id,
                attempt.action,
                attempt.failure_reason,
                attempt.gps_accuracy_meters,
                attempt.gps_distance_meters,
                attempt.created_at::text,
                employee.full_name as employee_name
         from public.clock_attempts attempt
         left join public.employees employee on employee.id = attempt.employee_id
         where attempt.location_id = any($1::uuid[])
           and attempt.success = false
         order by attempt.created_at desc
         limit 12`,
        [locationIds],
      ),
      getDatabase().query<{
        clocked_in_at: string
        clocked_out_at: string | null
        employee_name: string
        id: string
        source: "employee_nfc" | "manager_override" | "adjustment"
      }>(
        `select entry.id,
                entry.clocked_in_at::text,
                entry.clocked_out_at::text,
                entry.source,
                employee.full_name as employee_name
         from public.time_entries entry
         join public.employees employee on employee.id = entry.employee_id
         where entry.location_id = any($1::uuid[])
           and entry.status = 'requires_review'
         order by entry.clocked_in_at desc
         limit 20`,
        [locationIds],
      ),
    ])

  return {
    locations,
    employees: employeesResult.rows.map((employee) => ({
      id: employee.employee_id,
      locationId: employee.location_id,
      locationName: employee.location_name,
      name: employee.full_name,
      email: employee.email,
      isActive: employee.employee_status === "active",
      openEntry: employee.open_entry_id
        ? {
            id: employee.open_entry_id,
            clockedInAt: employee.clocked_in_at ?? "",
            isForgottenClockOutAlert: isPastForgottenClockOutAlert({
              now: new Date(),
              rules: {
                earlyClockInGraceMinutes: 10,
                earlyStartReviewMinutes: 15,
                forgottenClockOutAlertMinutes:
                  employee.forgotten_clock_out_alert_minutes ?? 120,
                hardReviewAfterMinutes:
                  employee.hard_review_after_minutes ?? 720,
                lateClockOutGraceMinutes: 10,
                lateFinishReviewMinutes: 15,
              },
              scheduledEndAt: employee.scheduled_end_at
                ? new Date(employee.scheduled_end_at)
                : null,
            }),
            scheduledEndAt: employee.scheduled_end_at,
            status: employee.status ?? "open",
            source: employee.source ?? "employee_nfc",
          }
        : null,
    })),
    failedAttempts: attemptsResult.rows.map((attempt) => ({
      id: attempt.id,
      employeeName: attempt.employee_name,
      action: attempt.action,
      failureReason: attempt.failure_reason,
      createdAt: attempt.created_at,
      gpsAccuracyMeters: attempt.gps_accuracy_meters,
      gpsDistanceMeters: attempt.gps_distance_meters,
    })),
    reviewEntries: reviewEntriesResult.rows.map((entry) => ({
      id: entry.id,
      employeeName: entry.employee_name,
      clockedInAt: entry.clocked_in_at,
      clockedOutAt: entry.clocked_out_at,
      source: entry.source,
    })),
  }
}

async function getClockSettingsPageData(input: {
  organizationId?: string
  locationId?: string
  userId: string
}): Promise<ClockSettingsPageData> {
  const scope = await requireClockSettingsScope(input)
  const locations = await listManagedClockLocations(scope)
  const locationIds = locations.map((location) => location.id)

  if (locationIds.length === 0) {
    return { locations: [] }
  }

  const settingsResult = await getDatabase().query<{
    is_enabled: boolean
    latitude: number | null
    location_id: string
    longitude: number | null
    max_accuracy_meters: number
    radius_meters: number
    timezone: string
    early_clock_in_grace_minutes: number
    early_start_review_minutes: number
    forgotten_clock_out_alert_minutes: number
    hard_review_after_minutes: number
    late_clock_out_grace_minutes: number
    late_finish_review_minutes: number
  }>(
    `select location_id,
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
     from public.location_clock_settings
     where location_id = any($1::uuid[])`,
    [locationIds],
  )

  const settingsByLocationId = new Map(
    settingsResult.rows.map((setting) => [setting.location_id, setting]),
  )
  return {
    locations: locations.map((location) => {
      const settings = settingsByLocationId.get(location.id)

      return {
        id: location.id,
        name: location.name,
        isEnabled: settings?.is_enabled ?? false,
        latitude: settings?.latitude ?? null,
        longitude: settings?.longitude ?? null,
        radiusMeters: settings?.radius_meters ?? 75,
        maxAccuracyMeters: settings?.max_accuracy_meters ?? 150,
        timezone: settings?.timezone ?? "Europe/London",
        earlyClockInGraceMinutes:
          settings?.early_clock_in_grace_minutes ?? 10,
        earlyStartReviewMinutes:
          settings?.early_start_review_minutes ?? 15,
        forgottenClockOutAlertMinutes:
          settings?.forgotten_clock_out_alert_minutes ?? 120,
        hardReviewAfterMinutes: settings?.hard_review_after_minutes ?? 720,
        lateClockOutGraceMinutes:
          settings?.late_clock_out_grace_minutes ?? 10,
        lateFinishReviewMinutes:
          settings?.late_finish_review_minutes ?? 15,
      }
    }),
  }
}

async function getClockTagContext(token: string) {
  const result = await getDatabase().query<ClockTagContextRow>(
    `select tag.id as clock_tag_id,
            tag.label as clock_label,
            location.id as location_id,
            location.name as location_name,
            location.organization_id,
            settings.is_enabled,
            settings.latitude,
            settings.longitude,
            settings.radius_meters,
            settings.max_accuracy_meters,
            settings.timezone,
            settings.early_clock_in_grace_minutes,
            settings.early_start_review_minutes,
            settings.forgotten_clock_out_alert_minutes,
            settings.hard_review_after_minutes,
            settings.late_clock_out_grace_minutes,
            settings.late_finish_review_minutes
     from public.clock_tags tag
     join public.locations location on location.id = tag.location_id
     left join public.location_clock_settings settings
       on settings.location_id = location.id
     where tag.token_hash = $1
       and tag.is_active = true
       and tag.disabled_at is null
     limit 1`,
    [hashClockToken(token)],
  )

  const context = result.rows.at(0)

  if (context) {
    return context
  }

  if (!isUuid(token)) {
    throw new Error("That clock link is not active.")
  }

  const locationResult = await getDatabase().query<ClockTagContextRow>(
    `select null::uuid as clock_tag_id,
            'Venue clock' as clock_label,
            location.id as location_id,
            location.name as location_name,
            location.organization_id,
            settings.is_enabled,
            settings.latitude,
            settings.longitude,
            settings.radius_meters,
            settings.max_accuracy_meters,
            settings.timezone,
            settings.early_clock_in_grace_minutes,
            settings.early_start_review_minutes,
            settings.forgotten_clock_out_alert_minutes,
            settings.hard_review_after_minutes,
            settings.late_clock_out_grace_minutes,
            settings.late_finish_review_minutes
     from public.locations location
     left join public.location_clock_settings settings
       on settings.location_id = location.id
     where location.id = $1::uuid
     limit 1`,
    [token],
  )
  const locationContext = locationResult.rows.at(0)

  if (!locationContext) {
    throw new Error("That clock link is not active.")
  }

  return locationContext
}

async function getActiveEmployeeForLocation(input: {
  locationId: string
  userId: string
}) {
  const result = await getDatabase().query<EmployeeRow>(
    `select employee.id, employee.full_name
     from public.employees employee
     join public.employee_location_assignments assignment
       on assignment.employee_id = employee.id
     where employee.user_id = $1
       and employee.status = 'active'
       and assignment.location_id = $2::uuid
       and assignment.is_enabled = true
       and assignment.disabled_at is null
     limit 1`,
    [input.userId, input.locationId],
  )
  const employee = result.rows.at(0)

  if (!employee) {
    throw new Error("Your account is not set up to clock in at this location.")
  }

  return employee
}

async function listOpenEntries(input: {
  employeeId: string
  locationId: string
}) {
  const result = await getDatabase().query<OpenEntryRow>(
    `select id, clocked_in_at::text, shift_segment, status
     from public.time_entries
     where employee_id = $1::uuid
       and location_id = $2::uuid
       and clocked_out_at is null
     order by clocked_in_at desc`,
    [input.employeeId, input.locationId],
  )

  return result.rows
}

async function getMatchedPublishedShift(input: {
  employeeId: string
  locationId: string
  now: Date
}) {
  const today = format(input.now, "yyyy-MM-dd")
  const result = await getDatabase().query<PublishedShiftCandidate>(
    `select published_shift.id,
            published_shift.day_date::text,
            published_shift.shift_type,
            published_shift.start_time::text,
            published_shift.end_time::text,
            published_shift.end_kind,
            published_shift.split_second_start_time::text,
            published_shift.split_second_end_time::text,
            published_shift.zone_name_snapshot
     from public.rota_published_shift_assignments assignment
     join public.rota_published_shifts published_shift
       on published_shift.id = assignment.rota_published_shift_id
     join public.rotas rota on rota.id = published_shift.rota_id
     where assignment.employee_id = $1::uuid
       and rota.location_id = $2::uuid
       and rota.status = 'published'
       and published_shift.day_date between ($3::date - interval '1 day')
           and ($3::date + interval '1 day')
     order by published_shift.day_date asc, published_shift.start_time asc`,
    [input.employeeId, input.locationId, today],
  )
  const match = findBestShiftMatch(result.rows, input.now)

  if (!match) {
    return null
  }

  return {
    id: match.id,
    dateLabel: formatShiftDate(format(match.startsAt, "yyyy-MM-dd")),
    segments: match.segments.map((segment) => ({
      endsAt: segment.endsAt.toISOString(),
      key: segment.key,
      label: segment.label,
      startsAt: segment.startsAt.toISOString(),
      timeLabel: segment.timeLabel,
    })),
    shiftType: match.shiftType,
    timeLabel: match.timeLabel,
    zoneName: match.zoneName,
  }
}

async function listCompletedShiftSegments(input: {
  employeeId: string
  rotaPublishedShiftId: string
}) {
  const result = await getDatabase().query<{ shift_segment: ClockShiftSegment }>(
    `select distinct shift_segment
     from public.time_entries
     where employee_id = $1::uuid
       and rota_published_shift_id = $2::uuid
       and clocked_out_at is not null`,
    [input.employeeId, input.rotaPublishedShiftId],
  )

  return result.rows.map((entry) => entry.shift_segment)
}

function getClockSetupMessage(input: {
  hasOpenEntry: boolean
  isEnabled: boolean
}) {
  if (input.hasOpenEntry) {
    return null
  }

  if (!input.isEnabled) {
    return "Clocking is not enabled for this location yet."
  }

  return null
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

export {
  getActiveEmployeeForLocation,
  getClockSettingsPageData,
  getClockTagContext,
  getEmployeeClockPageData,
  getManagerClockPageData,
  getMatchedPublishedShift,
  listOpenEntries,
}
