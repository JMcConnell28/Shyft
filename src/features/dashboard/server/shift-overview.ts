import { addDays, format, parseISO, startOfWeek } from "date-fns"

import type {
  DashboardClockStatus,
  DashboardShiftOverview,
  DashboardShiftSummary,
} from "@/features/dashboard/types"
import { listAccessibleLocations } from "@/features/rota/server/access"
import { getLocationRole } from "@/lib/auth/has-location-permission"
import { getOrgCapabilitiesForRole } from "@/lib/auth/get-org-capabilities"
import { getDatabase } from "@/lib/db"

type ShiftOverviewInput = {
  organizationId: string | null
  userId: string
  locationId?: string
}

type DashboardShiftRow = {
  id: string
  day_date: string
  end_kind: string | null
  end_time: string | null
  location_name: string
  location_slug: string
  rota_id: string
  shift_type: string
  split_second_end_time: string | null
  split_second_start_time: string | null
  start_time: string
  zone_name_snapshot: string
}

type DashboardClockEntryRow = {
  id: string
  clocked_in_at: string
  clocked_out_at: string | null
  location_name: string
  source: "employee_nfc" | "manager_override" | "adjustment"
  status: "open" | "closed" | "requires_review"
}

async function getDashboardShiftOverview(
  input: ShiftOverviewInput,
): Promise<DashboardShiftOverview> {
  const today = format(new Date(), "yyyy-MM-dd")
  const weekStart = format(
    startOfWeek(new Date(), {
      weekStartsOn: 1,
    }),
    "yyyy-MM-dd",
  )
  const weekEnd = format(addDays(parseISO(weekStart), 6), "yyyy-MM-dd")
  const weekRangeLabel = `${format(parseISO(weekStart), "d MMM")} - ${format(
    parseISO(weekEnd),
    "d MMM",
  )}`
  const locationIds = await listDashboardLocationIds(input)

  if (locationIds.length === 0) {
    return {
      clockStatus: getEmptyClockStatus(),
      nextShift: null,
      thisWeekShifts: [],
      weekRangeLabel,
    }
  }

  const employeeIds = await listUserEmployeeIds({
    ...input,
    locationIds,
  })

  if (employeeIds.length === 0) {
    return {
      clockStatus: getEmptyClockStatus(),
      nextShift: null,
      thisWeekShifts: [],
      weekRangeLabel,
    }
  }

  const [clockStatus, nextShiftRows, thisWeekRows] = await Promise.all([
    getDashboardClockStatus({
      employeeIds,
      locationIds,
      now: new Date(),
    }),
    listAssignedPublishedShifts({
      employeeIds,
      fromDate: today,
      limit: 1,
      locationIds,
      organizationId: input.organizationId,
    }),
    listAssignedPublishedShifts({
      employeeIds,
      fromDate: weekStart,
      locationIds,
      organizationId: input.organizationId,
      toDate: weekEnd,
    }),
  ])

  return {
    clockStatus,
    nextShift: nextShiftRows[0]
      ? mapDashboardShiftRow(nextShiftRows[0])
      : null,
    thisWeekShifts: thisWeekRows.map(mapDashboardShiftRow),
    weekRangeLabel,
  }
}

async function getDashboardClockStatus(input: {
  employeeIds: string[]
  locationIds: string[]
  now: Date
}): Promise<DashboardClockStatus> {
  const todayStart = new Date(
    input.now.getFullYear(),
    input.now.getMonth(),
    input.now.getDate(),
  )
  const result = await getDatabase().query<DashboardClockEntryRow>(
    `select entry.id,
            entry.clocked_in_at::text,
            entry.clocked_out_at::text,
            entry.status,
            entry.source,
            location.name as location_name
     from public.time_entries entry
     join public.locations location on location.id = entry.location_id
     where entry.employee_id = any($1::uuid[])
       and entry.location_id = any($2::uuid[])
       and (
         entry.clocked_in_at >= $3::timestamptz
         or entry.clocked_out_at is null
       )
     order by entry.clocked_in_at desc`,
    [input.employeeIds, input.locationIds, todayStart.toISOString()],
  )
  const openEntry = result.rows.find((entry) => entry.clocked_out_at === null)
  const completedTodayMs = result.rows.reduce((total, entry) => {
    if (!entry.clocked_out_at || new Date(entry.clocked_in_at) < todayStart) {
      return total
    }

    return total + getEntryDurationMs(entry)
  }, 0)
  const todayEntryCount = result.rows.filter(
    (entry) => new Date(entry.clocked_in_at) >= todayStart,
  ).length

  return {
    completedTodayMs,
    todayEntryCount,
    openEntry: openEntry
      ? {
          id: openEntry.id,
          clockedInAt: openEntry.clocked_in_at,
          locationName: openEntry.location_name,
          source: openEntry.source,
          status: openEntry.status,
        }
      : null,
  }
}

async function listDashboardLocationIds(input: ShiftOverviewInput) {
  if (input.locationId) {
    const role = await getLocationRole(input.locationId, input.userId)
    const capabilities = getOrgCapabilitiesForRole(role)

    return capabilities.canViewRota ? [input.locationId] : []
  }

  if (!input.organizationId) {
    return []
  }

  const locations = await listAccessibleLocations(
    input.organizationId,
    input.userId,
  )

  return locations.map((location) => location.id)
}

async function listUserEmployeeIds(input: ShiftOverviewInput & {
  locationIds: string[]
}) {
  const result = await getDatabase().query<{ id: string }>(
    `select distinct employee.id
     from public.employees employee
     join public.employee_location_assignments assignment
       on assignment.employee_id = employee.id
     where employee.user_id = $1
       and employee.status = 'active'
       and assignment.is_enabled = true
       and assignment.disabled_at is null
       and assignment.location_id = any($2::uuid[])
       and (
         ($3::text is not null and employee.organization_id = $3::text)
         or ($3::text is null and employee.organization_id is null)
       )`,
    [input.userId, input.locationIds, input.organizationId],
  )

  return result.rows.map((employee) => employee.id)
}

async function listAssignedPublishedShifts(input: {
  employeeIds: string[]
  fromDate: string
  limit?: number
  locationIds: string[]
  organizationId: string | null
  toDate?: string
}) {
  const result = await getDatabase().query<DashboardShiftRow>(
    `select
       shift.id,
       shift.day_date::text,
       shift.end_kind,
       shift.end_time::text,
       location.name as location_name,
       location.slug as location_slug,
       rota.id as rota_id,
       shift.shift_type,
       shift.split_second_end_time::text,
       shift.split_second_start_time::text,
       shift.start_time::text,
       shift.zone_name_snapshot
     from public.rota_published_shift_assignments assignment
     join public.rota_published_shifts shift
       on shift.id = assignment.rota_published_shift_id
     join public.rotas rota on rota.id = shift.rota_id
     join public.locations location on location.id = rota.location_id
     where assignment.employee_id = any($1::uuid[])
       and rota.status = 'published'
       and rota.location_id = any($2::uuid[])
       and shift.day_date >= $3::date
       and ($4::date is null or shift.day_date <= $4::date)
       and (
         ($5::text is not null and rota.organization_id = $5::text)
         or ($5::text is null and rota.organization_id is null)
       )
     order by shift.day_date asc, shift.start_time asc
     limit $6`,
    [
      input.employeeIds,
      input.locationIds,
      input.fromDate,
      input.toDate ?? null,
      input.organizationId,
      input.limit ?? 100,
    ],
  )

  return result.rows
}

function mapDashboardShiftRow(row: DashboardShiftRow): DashboardShiftSummary {
  return {
    id: row.id,
    dateLabel: format(parseISO(row.day_date), "d MMM"),
    dayLabel: format(parseISO(row.day_date), "EEE"),
    locationName: row.location_name,
    locationSlug: row.location_slug,
    rotaId: row.rota_id,
    timeLabel: getTimeLabel(row),
    zoneName: row.zone_name_snapshot,
  }
}

function getTimeLabel(row: DashboardShiftRow) {
  const startTime = formatTime(row.start_time)

  if (row.shift_type === "closing") {
    return `${startTime} - Close`
  }

  if (row.shift_type === "split") {
    const firstEnd = formatTime(row.end_time)
    const secondStart = formatTime(row.split_second_start_time)
    const secondEnd =
      row.end_kind === "location_close"
        ? "Close"
        : formatTime(row.split_second_end_time)

    return `${startTime} - ${firstEnd}, ${secondStart} - ${secondEnd}`
  }

  return `${startTime} - ${formatTime(row.end_time)}`
}

function formatTime(value: string | null) {
  return value?.slice(0, 5) ?? "--:--"
}

function getEntryDurationMs(entry: DashboardClockEntryRow) {
  if (!entry.clocked_out_at) {
    return 0
  }

  const clockedInAt = new Date(entry.clocked_in_at).getTime()
  const clockedOutAt = new Date(entry.clocked_out_at).getTime()

  if (!Number.isFinite(clockedInAt) || !Number.isFinite(clockedOutAt)) {
    return 0
  }

  return Math.max(0, clockedOutAt - clockedInAt)
}

function getEmptyClockStatus(): DashboardClockStatus {
  return {
    completedTodayMs: 0,
    openEntry: null,
    todayEntryCount: 0,
  }
}

export { getDashboardShiftOverview }
