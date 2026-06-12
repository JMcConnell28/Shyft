import { buildTimesheetPage } from "@/features/timesheets/server/build-timesheet"
import type {
  ScheduledShiftRow,
  TimeEntryRow,
  TimesheetEmployeeRow,
} from "@/features/timesheets/server/row-types"
import { resolveTimesheetAccess } from "@/features/timesheets/server/access"
import type {
  TimesheetPageData,
  TimesheetScopeInput,
} from "@/features/timesheets/types"
import { getTimesheetWeek } from "@/features/timesheets/utils/timesheet-time"
import type { TimesheetWeekDay } from "@/features/timesheets/utils/timesheet-time"
import { getDatabase } from "@/lib/db"

async function getTimesheetPageData(
  input: TimesheetScopeInput,
): Promise<TimesheetPageData> {
  const scope = await resolveTimesheetAccess(input)
  const week = getTimesheetWeek(input.weekStart)

  if (scope.locationIds.length === 0) {
    return {
      canManage: false,
      employeeTimesheet: getEmptyEmployeeTimesheet(week.days),
      locations: [],
      managerTimesheet: null,
      weekEnd: week.weekEnd,
      weekLabel: week.weekLabel,
      weekStart: week.weekStart,
    }
  }

  const [employeeRows, managerEmployeeRows, scheduledRows, entryRows] =
    await Promise.all([
      listUserEmployees({
        locationIds: scope.locationIds,
        organizationId: scope.organizationId,
        userId: scope.userId,
      }),
      scope.canManage
        ? listTimesheetEmployees(scope.locationIds)
        : Promise.resolve<TimesheetEmployeeRow[]>([]),
      listScheduledShifts({
        locationIds: scope.locationIds,
        organizationId: scope.organizationId,
        weekStart: week.weekStart,
      }),
      listTimeEntries({
        locationIds: scope.locationIds,
        organizationId: scope.organizationId,
        weekStart: week.weekStart,
      }),
    ])

  const employeeIds = employeeRows.map((employee) => employee.employee_id)
  const employees = scope.canManage ? managerEmployeeRows : employeeRows
  const shaped = buildTimesheetPage({
    employeeIds,
    employeeName: employeeRows[0]?.employee_name ?? "Your timesheet",
    employees,
    entries: entryRows,
    now: new Date(),
    scheduledShifts: scheduledRows,
    week,
  })

  return {
    canManage: scope.canManage,
    employeeTimesheet: shaped.employeeTimesheet,
    locations: scope.locations,
    managerTimesheet: scope.canManage ? shaped.managerTimesheet : null,
    weekEnd: week.weekEnd,
    weekLabel: week.weekLabel,
    weekStart: week.weekStart,
  }
}

async function listUserEmployees(input: {
  locationIds: string[]
  organizationId: string | null
  userId: string
}) {
  const result = await getDatabase().query<TimesheetEmployeeRow>(
    `select distinct
       employee.id as employee_id,
       employee.full_name as employee_name,
       location.name as location_name
     from public.employees employee
     join public.employee_location_assignments assignment
       on assignment.employee_id = employee.id
     join public.locations location on location.id = assignment.location_id
     where employee.user_id = $1
       and employee.status = 'active'
       and assignment.location_id = any($2::uuid[])
       and assignment.is_enabled = true
       and assignment.disabled_at is null
       and (
         ($3::text is not null and employee.organization_id = $3::text)
         or ($3::text is null)
       )
     order by employee.full_name asc`,
    [input.userId, input.locationIds, input.organizationId],
  )

  return result.rows
}

async function listTimesheetEmployees(locationIds: string[]) {
  const result = await getDatabase().query<TimesheetEmployeeRow>(
    `select distinct
       employee.id as employee_id,
       employee.full_name as employee_name,
       location.name as location_name
     from public.employee_location_assignments assignment
     join public.employees employee on employee.id = assignment.employee_id
     join public.locations location on location.id = assignment.location_id
     where assignment.location_id = any($1::uuid[])
       and employee.status = 'active'
       and assignment.is_enabled = true
       and assignment.disabled_at is null
     order by employee.full_name asc`,
    [locationIds],
  )

  return result.rows
}

async function listScheduledShifts(input: {
  locationIds: string[]
  organizationId: string | null
  weekStart: string
}) {
  const result = await getDatabase().query<ScheduledShiftRow>(
    `select
       shift.id,
       assignment.employee_id,
       employee.full_name as employee_name,
       location.id as location_id,
       location.name as location_name,
       rota.id as rota_id,
       rota.week_start::text as rota_week_start,
       shift.day_date::text,
       shift.end_kind,
       shift.end_time::text,
       shift.shift_type,
       shift.split_second_end_time::text,
       shift.split_second_start_time::text,
       shift.start_time::text,
       shift.zone_name_snapshot
     from public.rota_published_shift_assignments assignment
     join public.employees employee on employee.id = assignment.employee_id
     join public.rota_published_shifts shift
       on shift.id = assignment.rota_published_shift_id
     join public.rotas rota on rota.id = shift.rota_id
     join public.locations location on location.id = rota.location_id
     where rota.status = 'published'
       and rota.location_id = any($1::uuid[])
       and shift.day_date >= $2::date
       and shift.day_date < ($2::date + interval '7 day')
       and (
         ($3::text is not null and rota.organization_id = $3::text)
         or ($3::text is null)
       )
     order by employee.full_name asc, shift.day_date asc, shift.start_time asc`,
    [input.locationIds, input.weekStart, input.organizationId],
  )

  return result.rows
}

async function listTimeEntries(input: {
  locationIds: string[]
  organizationId: string | null
  weekStart: string
}) {
  const result = await getDatabase().query<TimeEntryRow>(
    `select
       entry.id,
       entry.employee_id,
       employee.full_name as employee_name,
       entry.location_id,
       location.name as location_name,
       entry.rota_published_shift_id,
       rota.id as rota_id,
       rota.week_start::text as rota_week_start,
       published_shift.zone_name_snapshot as zone_name,
       entry.shift_segment,
       entry.scheduled_start_at::text,
       entry.scheduled_end_at::text,
       entry.clocked_in_at::text,
       entry.clocked_out_at::text,
       entry.payable_start_at::text,
       entry.payable_end_at::text,
       entry.status,
       entry.source,
       entry.notes
     from public.time_entries entry
     join public.employees employee on employee.id = entry.employee_id
     join public.locations location on location.id = entry.location_id
     left join public.rota_published_shifts published_shift
       on published_shift.id = entry.rota_published_shift_id
     left join public.rotas rota on rota.id = published_shift.rota_id
     where entry.location_id = any($1::uuid[])
       and coalesce(entry.scheduled_start_at, entry.clocked_in_at) >= $2::date
       and coalesce(entry.scheduled_start_at, entry.clocked_in_at) <
         ($2::date + interval '7 day')
       and (
         ($3::text is not null and entry.organization_id = $3::text)
         or ($3::text is null)
       )
     order by employee.full_name asc, entry.clocked_in_at asc`,
    [input.locationIds, input.weekStart, input.organizationId],
  )

  return result.rows
}

function getEmptyEmployeeTimesheet(days: TimesheetWeekDay[]) {
  return {
    actualMinutes: 0,
    days: days.map((day) => ({
      ...day,
      actualMinutes: 0,
      entries: [],
      openEntryCount: 0,
      payableMinutes: 0,
      reviewCount: 0,
      scheduledMinutes: 0,
    })),
    employeeId: null,
    employeeName: "Your timesheet",
    openEntryCount: 0,
    payableMinutes: 0,
    reviewCount: 0,
    scheduledMinutes: 0,
  }
}

export { getTimesheetPageData }
