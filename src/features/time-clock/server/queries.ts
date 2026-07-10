import { addDays, format } from "date-fns"

import type {
  ClockAction,
  ClockEntryStatus,
  ClockInReviewPrompt,
  ClockSource,
  ClockSettingsPageData,
  ClockShiftSegment,
  EmployeeClockPageData,
  ManagerClockPageData,
} from "@/features/time-clock/types"
import type { PublishedShiftCandidate } from "@/features/time-clock/utils/shift-matching"
// eslint-disable-next-line no-duplicate-imports
import {
  findBestShiftMatch,
  formatShiftDate,
} from "@/features/time-clock/utils/shift-matching"
import { isPastForgottenClockOutAlert } from "@/features/time-clock/utils/pay-rules"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { getDatabase } from "@/lib/db"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import {
  assertSupabaseSuccess,
  getRequiredSupabaseRow,
} from "@/lib/supabase-errors"

import {
  assertCurrentUser,
  listManagedClockLocations,
  requireClockManagerScope,
  requireClockSettingsScope,
} from "@/features/time-clock/server/shared"

type SupabaseServer = ReturnType<typeof createSupabaseServerClient>

type ClockSessionContext = {
  action: ClockAction
  clockTagId: string
  employeeId: string
  expiresAt: string
  id: string
  locationId: string
  organizationId: string | null
  userId: string
}

type ClockStationBillingStatus =
  ClockSettingsPageData["locations"][number]["timeAttendanceStatus"]

type ClockStationHardwareEntitlementStatus =
  ClockSettingsPageData["locations"][number]["hardwareEntitlementStatus"]

type ClockStationHardwareFulfillmentStatus =
  ClockSettingsPageData["locations"][number]["hardwareFulfillmentStatus"]

type ClockStationBillingRow = {
  location_id: string
  time_attendance_status: ClockStationBillingStatus
  hardware_entitlement_status: ClockStationHardwareEntitlementStatus
  hardware_fulfillment_status: ClockStationHardwareFulfillmentStatus
}

type ClockRules = {
  earlyClockInGraceMinutes: number
  earlyStartReviewMinutes: number
  forgottenClockOutAlertMinutes: number
  hardReviewAfterMinutes: number
  lateClockInGraceMinutes: number
  lateClockOutGraceMinutes: number
  lateFinishReviewMinutes: number
  lateStartReviewMinutes: number
}

type OpenEntryRow = {
  clocked_in_at: string
  id: string
  scheduled_end_at: string | null
  scheduled_start_at: string | null
  shift_segment: string
  source: string
  status: string
}

async function getEmployeeClockPageData(input: {
  scanSessionId: string
  userId: string
}): Promise<EmployeeClockPageData> {
  const { session } = await requireVerifiedSessionOrThrow()
  assertCurrentUser(session.user.id, input.userId)
  const supabase = createSupabaseServerClient()
  const scanSession = await getClockScanSession(supabase, {
    scanSessionId: input.scanSessionId,
    userId: session.user.id,
  })

  return buildEmployeeClockPageData(supabase, scanSession, new Date())
}

async function buildEmployeeClockPageData(
  supabase: SupabaseServer,
  scanSession: ClockSessionContext,
  now: Date
): Promise<EmployeeClockPageData> {
  const [location, tag, settings, employee, openEntries] = await Promise.all([
    getLocation(supabase, scanSession.locationId),
    getClockTag(supabase, scanSession.clockTagId),
    getLocationClockSettings(supabase, scanSession.locationId),
    getEmployee(supabase, scanSession.employeeId),
    listOpenEntries({
      employeeId: scanSession.employeeId,
      locationId: scanSession.locationId,
    }),
  ])

  if (openEntries.length > 1) {
    throw new Error("Your time clock needs manager review before continuing.")
  }

  const matchedShift = await getMatchedPublishedShift({
    employeeId: employee.id,
    locationId: location.id,
    now,
  })
  const completedShiftSegments = matchedShift
    ? await listCompletedShiftSegments({
        employeeId: employee.id,
        rotaPublishedShiftId: matchedShift.id,
      })
    : []
  const isClockingEnabled = settings.isEnabled || Boolean(openEntries[0])

  return {
    clockLabel: tag.label,
    completedShiftSegments,
    employee: {
      id: employee.id,
      name: employee.full_name,
    },
    isClockingEnabled,
    location: {
      id: location.id,
      latitude: settings.latitude,
      longitude: settings.longitude,
      maxAccuracyMeters: settings.maxAccuracyMeters,
      name: location.name,
      radiusMeters: settings.radiusMeters,
    },
    matchedShift,
    nextAction: openEntries[0] ? "clock_out" : "clock_in",
    openEntry: openEntries[0]
      ? {
          id: openEntries[0].id,
          clockedInAt: openEntries[0].clocked_in_at,
          scheduledEndAt: openEntries[0].scheduled_end_at,
          scheduledStartAt: openEntries[0].scheduled_start_at,
          shiftSegment: toClockShiftSegment(openEntries[0].shift_segment),
          status: toClockEntryStatus(openEntries[0].status),
        }
      : null,
    reviewPrompt: getClockInReviewPrompt({
      matchedShift,
      now,
      nextAction: scanSession.action,
      rules: settings.rules,
    }),
    scanExpiresAt: scanSession.expiresAt,
    scanSessionId: scanSession.id,
    setupMessage: getClockSetupMessage({
      hasOpenEntry: Boolean(openEntries[0]),
      isEnabled: settings.isEnabled,
    }),
  }
}

async function getManagerClockPageData(input: {
  organizationId?: string
  locationId?: string
  userId: string
  date?: string
}): Promise<ManagerClockPageData> {
  const scope = await requireClockManagerScope(input)
  const locations = await listManagedClockLocations(scope)
  const locationIds = locations.map((location) => location.id)
  const selectedDate = input.date ?? format(new Date(), "yyyy-MM-dd")

  if (locationIds.length === 0) {
    return {
      selectedDate,
      locations: [],
      employees: [],
      activityEntries: [],
      failedAttempts: [],
      reviewEntries: [],
    }
  }

  const supabase = createSupabaseServerClient()
  const [settings, employees, openEntries, activityEntries, failedAttempts] =
    await Promise.all([
      listClockSettingsForLocations(supabase, locationIds),
      listAssignedEmployees(supabase, locationIds),
      listOpenEntriesForLocations(supabase, locationIds),
      listActivityEntries(supabase, locationIds, selectedDate),
      listFailedAttempts(supabase, locationIds),
    ])
  const employeeNameById = new Map(
    employees.map((employee) => [employee.id, employee.full_name])
  )
  const locationNameById = new Map(
    locations.map((location) => [location.id, location.name])
  )
  const settingsByLocationId = new Map(
    settings.map((item) => [item.locationId, item])
  )
  const openEntryByEmployeeLocation = new Map(
    openEntries.map((entry) => [
      getEmployeeLocationKey(entry.employee_id, entry.location_id),
      entry,
    ])
  )

  return {
    selectedDate,
    locations: locations.map((location) => ({
      id: location.id,
      name: location.name,
    })),
    employees: employees.map((employee) => {
      const openEntry = openEntryByEmployeeLocation.get(
        getEmployeeLocationKey(employee.id, employee.location_id)
      )
      const locationSettings = settingsByLocationId.get(employee.location_id)

      return {
        id: employee.id,
        locationId: employee.location_id,
        locationName: locationNameById.get(employee.location_id) ?? "Location",
        name: employee.full_name,
        email: employee.email,
        isActive: employee.status === "active",
        openEntry: openEntry
          ? {
              id: openEntry.id,
              clockedInAt: openEntry.clocked_in_at,
              isForgottenClockOutAlert: isPastForgottenClockOutAlert({
                now: new Date(),
                rules: locationSettings?.rules ?? defaultClockRules(),
                scheduledEndAt: openEntry.scheduled_end_at
                  ? new Date(openEntry.scheduled_end_at)
                  : null,
              }),
              scheduledEndAt: openEntry.scheduled_end_at,
              status: toClockEntryStatus(openEntry.status),
              source: toClockSource(openEntry.source),
            }
          : null,
      }
    }),
    activityEntries: activityEntries.map((entry) => {
      const locationSettings = settingsByLocationId.get(entry.location_id)

      return {
        id: entry.id,
        employeeId: entry.employee_id,
        employeeName: employeeNameById.get(entry.employee_id) ?? "Unknown",
        locationId: entry.location_id,
        locationName: locationNameById.get(entry.location_id) ?? "Location",
        zoneName: entry.zone_name,
        clockedInAt: entry.clocked_in_at,
        clockedOutAt: entry.clocked_out_at,
        isForgottenClockOutAlert:
          !entry.clocked_out_at &&
          isPastForgottenClockOutAlert({
            now: new Date(),
            rules: locationSettings?.rules ?? defaultClockRules(),
            scheduledEndAt: entry.scheduled_end_at
              ? new Date(entry.scheduled_end_at)
              : null,
          }),
        scheduledEndAt: entry.scheduled_end_at,
        source: toClockSource(entry.source),
        status: toClockEntryStatus(entry.status),
      }
    }),
    failedAttempts: failedAttempts.map((attempt) => ({
      id: attempt.id,
      employeeName: attempt.employee_id
        ? employeeNameById.get(attempt.employee_id) ?? null
        : null,
      action:
        attempt.action === "clock_in" || attempt.action === "clock_out"
          ? attempt.action
          : null,
      failureReason: attempt.failure_reason,
      createdAt: attempt.created_at,
      gpsAccuracyMeters: attempt.gps_accuracy_meters,
      gpsDistanceMeters: attempt.gps_distance_meters,
    })),
    reviewEntries: activityEntries
      .filter((entry) => entry.status === "requires_review")
      .map((entry) => ({
        id: entry.id,
        employeeName: employeeNameById.get(entry.employee_id) ?? "Unknown",
        clockedInAt: entry.clocked_in_at,
        clockedOutAt: entry.clocked_out_at,
        source: toClockSource(entry.source),
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

  const supabase = createSupabaseServerClient()
  const [settings, tags, stationBillingStates] = await Promise.all([
    listClockSettingsForLocations(supabase, locationIds),
    listClockTagSetups(supabase, locationIds),
    listClockStationBillingStates(locationIds),
  ])
  const settingsByLocationId = new Map(
    settings.map((setting) => [setting.locationId, setting])
  )
  const tagsByLocationId = groupClockTagSetups(tags)
  const stationBillingStateByLocationId = new Map(
    stationBillingStates.map((state) => [state.locationId, state])
  )

  return {
    locations: locations.map((location) => {
      const setting = settingsByLocationId.get(location.id)
      const rules = setting?.rules ?? defaultClockRules()
      const stationBillingState = stationBillingStateByLocationId.get(
        location.id
      )

      return {
        id: location.id,
        name: location.name,
        isEnabled: setting?.isEnabled ?? false,
        timeAttendanceEnabled:
          stationBillingState?.timeAttendanceEnabled ?? false,
        timeAttendanceStatus:
          stationBillingState?.timeAttendanceStatus ?? null,
        hardwareEntitlementStatus:
          stationBillingState?.hardwareEntitlementStatus ?? null,
        hardwareFulfillmentStatus:
          stationBillingState?.hardwareFulfillmentStatus ?? null,
        latitude: setting?.latitude ?? null,
        longitude: setting?.longitude ?? null,
        radiusMeters: setting?.radiusMeters ?? 75,
        maxAccuracyMeters: setting?.maxAccuracyMeters ?? 150,
        timezone: setting?.timezone ?? "Europe/London",
        earlyClockInGraceMinutes: rules.earlyClockInGraceMinutes,
        earlyStartReviewMinutes: rules.earlyStartReviewMinutes,
        forgottenClockOutAlertMinutes: rules.forgottenClockOutAlertMinutes,
        hardReviewAfterMinutes: rules.hardReviewAfterMinutes,
        lateClockInGraceMinutes: rules.lateClockInGraceMinutes,
        lateClockOutGraceMinutes: rules.lateClockOutGraceMinutes,
        lateFinishReviewMinutes: rules.lateFinishReviewMinutes,
        lateStartReviewMinutes: rules.lateStartReviewMinutes,
        ntagTags: tagsByLocationId.get(location.id) ?? [],
      }
    }),
  }
}

async function getClockScanSession(
  supabase: SupabaseServer,
  input: { scanSessionId: string; userId: string }
): Promise<ClockSessionContext> {
  const result = await supabase
    .from("clock_scan_sessions")
    .select(
      "id, user_id, employee_id, organization_id, location_id, clock_tag_id, action, expires_at, consumed_at"
    )
    .eq("id", input.scanSessionId)
    .eq("user_id", input.userId)
    .maybeSingle()

  assertSupabaseSuccess(result.error, "We could not load that clock session.")
  const row = getRequiredSupabaseRow(
    result.data,
    "That clock link is no longer active."
  )

  if (row.consumed_at) {
    throw new Error("That clock link has already been used.")
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    throw new Error("That clock link has expired. Tap the tag again.")
  }

  return {
    id: row.id,
    action: toClockAction(row.action),
    clockTagId: row.clock_tag_id,
    employeeId: row.employee_id,
    expiresAt: row.expires_at,
    locationId: row.location_id,
    organizationId: row.organization_id,
    userId: row.user_id,
  }
}

async function getLocation(supabase: SupabaseServer, locationId: string) {
  const result = await supabase
    .from("locations")
    .select("id, name, organization_id")
    .eq("id", locationId)
    .single()

  assertSupabaseSuccess(result.error, "We could not load that location.")
  return getRequiredSupabaseRow(result.data, "Choose a valid location.")
}

async function getClockTag(supabase: SupabaseServer, clockTagId: string) {
  const result = await supabase
    .from("clock_tags")
    .select("id, label")
    .eq("id", clockTagId)
    .single()

  assertSupabaseSuccess(result.error, "We could not load that clock tag.")
  return getRequiredSupabaseRow(result.data, "Choose a valid clock tag.")
}

async function getEmployee(supabase: SupabaseServer, employeeId: string) {
  const result = await supabase
    .from("employees")
    .select("id, full_name")
    .eq("id", employeeId)
    .single()

  assertSupabaseSuccess(result.error, "We could not load your employee record.")
  return getRequiredSupabaseRow(
    result.data,
    "Your account is not set up for this location."
  )
}

async function getLocationClockSettings(
  supabase: SupabaseServer,
  locationId: string
) {
  const settings = await listClockSettingsForLocations(supabase, [locationId])
  return (
    settings[0] ?? {
      isEnabled: false,
      latitude: null,
      locationId,
      longitude: null,
      maxAccuracyMeters: 150,
      radiusMeters: 75,
      rules: defaultClockRules(),
      timezone: "Europe/London",
    }
  )
}

async function listClockSettingsForLocations(
  supabase: SupabaseServer,
  locationIds: Array<string>
) {
  const result = await supabase
    .from("location_clock_settings")
    .select(
      "location_id, is_enabled, latitude, longitude, radius_meters, max_accuracy_meters, timezone, early_clock_in_grace_minutes, early_start_review_minutes, late_clock_in_grace_minutes, late_start_review_minutes, forgotten_clock_out_alert_minutes, hard_review_after_minutes, late_clock_out_grace_minutes, late_finish_review_minutes"
    )
    .in("location_id", locationIds)

  assertSupabaseSuccess(result.error, "We could not load clock settings.")

  return (result.data ?? []).map((setting) => ({
    isEnabled: setting.is_enabled,
    latitude: setting.latitude,
    locationId: setting.location_id,
    longitude: setting.longitude,
    maxAccuracyMeters: setting.max_accuracy_meters,
    radiusMeters: setting.radius_meters,
    timezone: setting.timezone,
    rules: {
      earlyClockInGraceMinutes: setting.early_clock_in_grace_minutes,
      earlyStartReviewMinutes: setting.early_start_review_minutes,
      forgottenClockOutAlertMinutes: setting.forgotten_clock_out_alert_minutes,
      hardReviewAfterMinutes: setting.hard_review_after_minutes,
      lateClockInGraceMinutes: setting.late_clock_in_grace_minutes,
      lateClockOutGraceMinutes: setting.late_clock_out_grace_minutes,
      lateFinishReviewMinutes: setting.late_finish_review_minutes,
      lateStartReviewMinutes: setting.late_start_review_minutes,
    },
  }))
}

async function listClockStationBillingStates(locationIds: Array<string>) {
  const result = await getDatabase().query<ClockStationBillingRow>(
    `select
       location.id as location_id,
       addon.status as time_attendance_status,
       hardware.entitlement_status as hardware_entitlement_status,
       hardware.fulfillment_status as hardware_fulfillment_status
     from public.locations location
     left join billing_private.location_addons addon
       on addon.location_id = location.id
      and addon.addon_type = 'time_attendance'
     left join billing_private.location_hardware_entitlements hardware
       on hardware.location_id = location.id
     where location.id = any($1::uuid[])`,
    [locationIds]
  )

  return result.rows.map((row) => ({
    locationId: row.location_id,
    timeAttendanceEnabled:
      row.time_attendance_status === "trialing" ||
      row.time_attendance_status === "active" ||
      row.time_attendance_status === "canceling",
    timeAttendanceStatus: row.time_attendance_status,
    hardwareEntitlementStatus: row.hardware_entitlement_status,
    hardwareFulfillmentStatus: row.hardware_fulfillment_status,
  }))
}

async function listClockTagSetups(
  supabase: SupabaseServer,
  locationIds: Array<string>
) {
  const result = await supabase
    .from("clock_tags")
    .select(
      "id, location_id, label, ntag_public_id, ntag_aes_key_hex, ntag_last_seen_counter"
    )
    .in("location_id", locationIds)
    .eq("is_active", true)
    .is("disabled_at", null)
    .not("ntag_public_id", "is", null)
    .not("ntag_aes_key_hex", "is", null)
    .order("created_at", { ascending: false })

  assertSupabaseSuccess(result.error, "We could not load clock tags.")
  return result.data ?? []
}

async function listOpenEntries(input: {
  employeeId: string
  locationId: string
}): Promise<Array<OpenEntryRow>> {
  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("time_entries")
    .select(
      "id, clocked_in_at, scheduled_start_at, scheduled_end_at, shift_segment, status, source"
    )
    .eq("employee_id", input.employeeId)
    .eq("location_id", input.locationId)
    .is("clocked_out_at", null)
    .order("clocked_in_at", { ascending: false })

  assertSupabaseSuccess(result.error, "We could not load open entries.")
  return result.data ?? []
}

async function listOpenEntriesForLocations(
  supabase: SupabaseServer,
  locationIds: Array<string>
) {
  const result = await supabase
    .from("time_entries")
    .select(
      "id, employee_id, location_id, clocked_in_at, scheduled_start_at, scheduled_end_at, shift_segment, status, source"
    )
    .in("location_id", locationIds)
    .is("clocked_out_at", null)
    .order("clocked_in_at", { ascending: false })

  assertSupabaseSuccess(result.error, "We could not load open entries.")
  return result.data ?? []
}

async function listAssignedEmployees(
  supabase: SupabaseServer,
  locationIds: Array<string>
) {
  const assignmentResult = await supabase
    .from("employee_location_assignments")
    .select("employee_id, location_id")
    .in("location_id", locationIds)
    .eq("is_enabled", true)
    .is("disabled_at", null)

  assertSupabaseSuccess(
    assignmentResult.error,
    "We could not load team assignments."
  )
  const assignments = assignmentResult.data ?? []
  const employeeIds = [...new Set(assignments.map((item) => item.employee_id))]

  if (employeeIds.length === 0) {
    return []
  }

  const employeeResult = await supabase
    .from("employees")
    .select("id, full_name, email, status")
    .in("id", employeeIds)
    .order("full_name", { ascending: true })

  assertSupabaseSuccess(employeeResult.error, "We could not load employees.")
  const employeeById = new Map(
    (employeeResult.data ?? []).map((employee) => [employee.id, employee])
  )

  return assignments
    .map((assignment) => {
      const employee = employeeById.get(assignment.employee_id)
      return employee
        ? {
            ...employee,
            location_id: assignment.location_id,
          }
        : null
    })
    .filter((employee): employee is NonNullable<typeof employee> =>
      Boolean(employee)
    )
}

async function listActivityEntries(
  supabase: SupabaseServer,
  locationIds: Array<string>,
  selectedDate: string
) {
  const nextDate = format(addDays(new Date(`${selectedDate}T00:00:00`), 1), "yyyy-MM-dd")
  const result = await supabase
    .from("time_entries")
    .select(
      "id, employee_id, location_id, rota_published_shift_id, clocked_in_at, clocked_out_at, scheduled_end_at, source, status"
    )
    .in("location_id", locationIds)
    .gte("clocked_in_at", selectedDate)
    .lt("clocked_in_at", nextDate)
    .order("clocked_in_at", { ascending: true })
    .limit(60)

  assertSupabaseSuccess(result.error, "We could not load clock activity.")
  const entries = result.data ?? []
  const shiftIds = entries
    .map((entry) => entry.rota_published_shift_id)
    .filter((id): id is string => Boolean(id))
  const zoneNameByShiftId = await getZoneNamesByPublishedShiftId(
    supabase,
    shiftIds
  )

  return entries.map((entry) => ({
    ...entry,
    zone_name: entry.rota_published_shift_id
      ? zoneNameByShiftId.get(entry.rota_published_shift_id) ?? null
      : null,
  }))
}

async function listFailedAttempts(
  supabase: SupabaseServer,
  locationIds: Array<string>
) {
  const result = await supabase
    .from("clock_attempts")
    .select(
      "id, employee_id, action, failure_reason, gps_accuracy_meters, gps_distance_meters, created_at"
    )
    .in("location_id", locationIds)
    .eq("success", false)
    .order("created_at", { ascending: false })
    .limit(12)

  assertSupabaseSuccess(result.error, "We could not load failed attempts.")
  return result.data ?? []
}

async function getZoneNamesByPublishedShiftId(
  supabase: SupabaseServer,
  shiftIds: Array<string>
) {
  if (shiftIds.length === 0) {
    return new Map<string, string>()
  }

  const result = await supabase
    .from("rota_published_shifts")
    .select("id, zone_name_snapshot")
    .in("id", shiftIds)

  assertSupabaseSuccess(result.error, "We could not load shift zones.")
  return new Map(
    (result.data ?? []).map((shift) => [shift.id, shift.zone_name_snapshot])
  )
}

async function getMatchedPublishedShift(input: {
  employeeId: string
  locationId: string
  now: Date
}): Promise<EmployeeClockPageData["matchedShift"]> {
  const supabase = createSupabaseServerClient()
  const assignmentResult = await supabase
    .from("rota_published_shift_assignments")
    .select("rota_published_shift_id")
    .eq("employee_id", input.employeeId)

  assertSupabaseSuccess(
    assignmentResult.error,
    "We could not load your scheduled shifts."
  )
  const shiftIds = (assignmentResult.data ?? []).map(
    (assignment) => assignment.rota_published_shift_id
  )

  if (shiftIds.length === 0) {
    return null
  }

  const today = format(input.now, "yyyy-MM-dd")
  const fromDate = format(addDays(new Date(`${today}T00:00:00`), -1), "yyyy-MM-dd")
  const toDate = format(addDays(new Date(`${today}T00:00:00`), 1), "yyyy-MM-dd")
  const shiftResult = await supabase
    .from("rota_published_shifts")
    .select(
      "id, rota_id, day_date, shift_type, start_time, end_time, end_kind, split_second_start_time, split_second_end_time, zone_name_snapshot"
    )
    .in("id", shiftIds)
    .gte("day_date", fromDate)
    .lte("day_date", toDate)
    .order("day_date", { ascending: true })
    .order("start_time", { ascending: true })

  assertSupabaseSuccess(shiftResult.error, "We could not load your shift.")
  const shifts = shiftResult.data ?? []

  if (shifts.length === 0) {
    return null
  }

  const rotaIds = [...new Set(shifts.map((shift) => shift.rota_id))]
  const rotaResult = await supabase
    .from("rotas")
    .select("id, location_id, status")
    .in("id", rotaIds)
    .eq("location_id", input.locationId)
    .eq("status", "published")

  assertSupabaseSuccess(rotaResult.error, "We could not load your rota.")
  const publishedRotaIds = new Set((rotaResult.data ?? []).map((rota) => rota.id))
  const candidates: Array<PublishedShiftCandidate> = shifts
    .filter((shift) => publishedRotaIds.has(shift.rota_id))
    .map((shift) => ({
      id: shift.id,
      day_date: shift.day_date,
      end_kind: shift.end_kind,
      end_time: shift.end_time,
      shift_type: shift.shift_type,
      split_second_end_time: shift.split_second_end_time,
      split_second_start_time: shift.split_second_start_time,
      start_time: shift.start_time,
      zone_name_snapshot: shift.zone_name_snapshot,
    }))
  const match = findBestShiftMatch(candidates, input.now)

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
  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("time_entries")
    .select("shift_segment")
    .eq("employee_id", input.employeeId)
    .eq("rota_published_shift_id", input.rotaPublishedShiftId)
    .not("clocked_out_at", "is", null)

  assertSupabaseSuccess(result.error, "We could not load completed shifts.")

  return (result.data ?? []).map((entry) =>
    toClockShiftSegment(entry.shift_segment)
  )
}

function getClockInReviewPrompt(input: {
  matchedShift: EmployeeClockPageData["matchedShift"]
  nextAction: ClockAction
  now: Date
  rules: ClockRules
}): ClockInReviewPrompt {
  if (input.nextAction === "clock_out") {
    return emptyReviewPrompt()
  }

  const firstSegment = input.matchedShift?.segments[0]

  if (!input.matchedShift || !firstSegment) {
    return {
      defaultMode: "now",
      isReasonRequired: true,
      kind: "unmatched",
      message: "No published shift matched this tap. Add a reason for review.",
      scheduledStartAt: null,
    }
  }

  const scheduledStart = new Date(firstSegment.startsAt)
  const diffMinutes =
    (input.now.getTime() - scheduledStart.getTime()) / (60 * 1000)

  if (diffMinutes < -input.rules.earlyClockInGraceMinutes) {
    return {
      defaultMode: "scheduled",
      isReasonRequired: false,
      kind: "early",
      message:
        "You are early. You can clock in now and start paid time at your scheduled start.",
      scheduledStartAt: scheduledStart.toISOString(),
    }
  }

  if (diffMinutes > input.rules.lateClockInGraceMinutes) {
    return {
      defaultMode: "now",
      isReasonRequired: true,
      kind: "late",
      message:
        "This clock-in is later than the grace period. Choose a reason before continuing.",
      scheduledStartAt: scheduledStart.toISOString(),
    }
  }

  return emptyReviewPrompt()
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

function groupClockTagSetups(rows: Awaited<ReturnType<typeof listClockTagSetups>>) {
  const tagsByLocationId = new Map<
    string,
    ClockSettingsPageData["locations"][number]["ntagTags"]
  >()

  for (const row of rows) {
    const tags = tagsByLocationId.get(row.location_id) ?? []

    tags.push({
      id: row.id,
      aesKeyHex: row.ntag_aes_key_hex ?? "",
      label: row.label,
      lastSeenCounter: row.ntag_last_seen_counter,
      publicId: row.ntag_public_id ?? "",
    })
    tagsByLocationId.set(row.location_id, tags)
  }

  return tagsByLocationId
}

function emptyReviewPrompt(): ClockInReviewPrompt {
  return {
    defaultMode: null,
    isReasonRequired: false,
    kind: "none",
    message: null,
    scheduledStartAt: null,
  }
}

function defaultClockRules(): ClockRules {
  return {
    earlyClockInGraceMinutes: 10,
    earlyStartReviewMinutes: 15,
    forgottenClockOutAlertMinutes: 120,
    hardReviewAfterMinutes: 720,
    lateClockInGraceMinutes: 5,
    lateClockOutGraceMinutes: 10,
    lateFinishReviewMinutes: 15,
    lateStartReviewMinutes: 15,
  }
}

function getEmployeeLocationKey(employeeId: string, locationId: string) {
  return `${employeeId}:${locationId}`
}

function toClockAction(value: string): ClockAction {
  return value === "clock_out" ? "clock_out" : "clock_in"
}

function toClockShiftSegment(value: string): ClockShiftSegment {
  if (value === "split_first" || value === "split_second") {
    return value
  }

  return "full"
}

function toClockEntryStatus(value: string): ClockEntryStatus {
  if (value === "closed" || value === "requires_review") {
    return value
  }

  return "open"
}

function toClockSource(value: string): ClockSource {
  if (value === "manager_override" || value === "adjustment") {
    return value
  }

  return "employee_nfc"
}

export {
  buildEmployeeClockPageData,
  getClockSettingsPageData,
  getEmployeeClockPageData,
  getManagerClockPageData,
  getMatchedPublishedShift,
  listOpenEntries,
}
export type { ClockRules, ClockSessionContext }
