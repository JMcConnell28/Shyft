import type {
  ScheduledShiftRow,
  TimeEntryRow,
} from "@/features/timesheets/server/row-types"
import { getDatabase } from "@/lib/db"
import { DEFAULT_CLOCK_TIME_ZONE } from "@/lib/time-zone"

type TimesheetWeekRecordsInput = {
  employeeUserId: string | null
  locationIds: Array<string>
  organizationId: string | null
  weekStart: string
}

async function listScheduledShifts(
  input: TimesheetWeekRecordsInput
): Promise<Array<ScheduledShiftRow>> {
  const result = await getDatabase().query<ScheduledShiftRow>(
    `select
       shift.id,
       assignment.employee_id,
       employee.full_name as employee_name,
       employee.payroll_id as employee_payroll_id,
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
       shift.zone_name_snapshot,
       coalesce(clock_settings.timezone, $5::text) as time_zone
     from public.rota_published_shift_assignments assignment
     join public.employees employee on employee.id = assignment.employee_id
     join public.rota_published_shifts shift
       on shift.id = assignment.rota_published_shift_id
     join public.rotas rota on rota.id = shift.rota_id
     join public.locations location on location.id = rota.location_id
     left join public.location_clock_settings clock_settings
       on clock_settings.location_id = location.id
     where rota.status = 'published'
       and rota.location_id = any($1::uuid[])
       and shift.day_date >= $2::date
       and shift.day_date < ($2::date + interval '7 day')
       and (
         ($3::text is not null and rota.organization_id = $3::text)
         or ($3::text is null)
       )
       and ($4::text is null or employee.user_id = $4::text)
     order by employee.full_name asc, shift.day_date asc, shift.start_time asc`,
    [
      input.locationIds,
      input.weekStart,
      input.organizationId,
      input.employeeUserId,
      DEFAULT_CLOCK_TIME_ZONE,
    ]
  )

  return result.rows
}

async function listTimeEntries(
  input: TimesheetWeekRecordsInput
): Promise<Array<TimeEntryRow>> {
  const result = await getDatabase().query<TimeEntryRow>(
    `select
       entry.id,
       entry.employee_id,
       employee.full_name as employee_name,
       employee.payroll_id as employee_payroll_id,
       entry.location_id,
       location.name as location_name,
       coalesce(clock_settings.timezone, $5::text) as time_zone,
       entry.rota_published_shift_id,
       rota.id as rota_id,
       rota.week_start::text as rota_week_start,
       published_shift.zone_name_snapshot as zone_name,
       published_shift.day_date::text as published_day_date,
       published_shift.shift_type as published_shift_type,
       published_shift.start_time::text as published_start_time,
       published_shift.end_time::text as published_end_time,
       published_shift.end_kind as published_end_kind,
       published_shift.split_second_start_time::text as published_split_second_start_time,
       published_shift.split_second_end_time::text as published_split_second_end_time,
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
     left join public.location_clock_settings clock_settings
       on clock_settings.location_id = location.id
     left join public.rota_published_shifts published_shift
       on published_shift.id = entry.rota_published_shift_id
     left join public.rotas rota on rota.id = published_shift.rota_id
     where entry.location_id = any($1::uuid[])
       and coalesce(
         published_shift.day_date,
         (
           coalesce(entry.scheduled_start_at, entry.clocked_in_at)
           at time zone coalesce(clock_settings.timezone, $5::text)
         )::date
       ) >= $2::date
       and coalesce(
         published_shift.day_date,
         (
           coalesce(entry.scheduled_start_at, entry.clocked_in_at)
           at time zone coalesce(clock_settings.timezone, $5::text)
         )::date
       ) < ($2::date + interval '7 day')::date
       and (
         ($3::text is not null and entry.organization_id = $3::text)
         or ($3::text is null)
       )
       and ($4::text is null or employee.user_id = $4::text)
     order by employee.full_name asc, entry.clocked_in_at asc`,
    [
      input.locationIds,
      input.weekStart,
      input.organizationId,
      input.employeeUserId,
      DEFAULT_CLOCK_TIME_ZONE,
    ]
  )

  return result.rows
}

export { listScheduledShifts, listTimeEntries }
