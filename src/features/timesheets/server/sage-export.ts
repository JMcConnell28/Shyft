import { mapEntryRows } from "@/features/timesheets/server/entry-mapping"
import type {
  ScheduledShiftRow,
  TimeEntryRow,
} from "@/features/timesheets/server/row-types"
import { resolveTimesheetAccess } from "@/features/timesheets/server/access"
import type {
  SageTimesheetExportData,
  SageTimesheetExportInput,
} from "@/features/timesheets/types"
import { isRotaWeekBeforeCurrentWeek } from "@/features/rota/utils/week-utils"
import {
  buildSageTimesheetExportData,
  getMissingPayrollEmployees,
  getUnresolvedEntryEmployees,
} from "@/features/timesheets/utils/sage-timesheet-export"
import { getDatabase } from "@/lib/db"

type ExportRotaRow = {
  id: string
  location_id: string
  location_name: string
  location_slug: string | null
  status: string
  week_start: string
}

async function getSageTimesheetExportData(
  input: SageTimesheetExportInput
): Promise<SageTimesheetExportData> {
  const scope = await resolveTimesheetAccess(input)

  if (!scope.canManage) {
    throw new Error("You do not have permission to export timesheets.")
  }

  const rota = await getExportRota({
    locationIds: scope.locationIds,
    organizationId: scope.organizationId,
    rotaId: input.rotaId,
  })

  if (rota.status !== "published") {
    throw new Error("Only published rotas can be exported.")
  }

  if (!isRotaWeekBeforeCurrentWeek(rota.week_start)) {
    throw new Error("Sage exports are only available for completed rota weeks.")
  }

  const [scheduledRows, entryRows] = await Promise.all([
    listScheduledShiftsForRota(rota.id),
    listTimeEntriesForRotaWeek({
      locationId: rota.location_id,
      organizationId: scope.organizationId,
      weekStart: rota.week_start,
    }),
  ])
  const entries = mapEntryRows({
    entries: entryRows,
    now: new Date(),
    scheduledShifts: scheduledRows,
  })
  const unresolvedEmployees = getUnresolvedEntryEmployees(entries)

  if (unresolvedEmployees.length > 0) {
    throw new Error(
      `Resolve open or review timesheets before exporting: ${unresolvedEmployees.join(", ")}.`
    )
  }

  const missingPayrollEmployees = getMissingPayrollEmployees(entries)

  if (missingPayrollEmployees.length > 0) {
    throw new Error(
      `Add Sage payroll IDs before exporting: ${missingPayrollEmployees.join(", ")}.`
    )
  }

  return buildSageTimesheetExportData({
    entries,
    locationName: rota.location_name,
    locationSlug: rota.location_slug,
    rotaId: rota.id,
    weekStart: rota.week_start,
  })
}

async function getExportRota(input: {
  locationIds: string[]
  organizationId: string | null
  rotaId: string
}) {
  const result = await getDatabase().query<ExportRotaRow>(
    `select
       rota.id,
       rota.location_id,
       location.name as location_name,
       location.slug as location_slug,
       rota.status,
       rota.week_start::text
     from public.rotas rota
     join public.locations location on location.id = rota.location_id
     where rota.id = $1::uuid
       and rota.location_id = any($2::uuid[])
       and (
         ($3::text is not null and rota.organization_id = $3::text)
         or ($3::text is null and rota.organization_id is null)
       )
     limit 1`,
    [input.rotaId, input.locationIds, input.organizationId]
  )
  const rota = result.rows[0]

  if (!rota) {
    throw new Error("Choose a published rota you can manage.")
  }

  return rota
}

async function listScheduledShiftsForRota(rotaId: string) {
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
       shift.zone_name_snapshot
     from public.rota_published_shift_assignments assignment
     join public.employees employee on employee.id = assignment.employee_id
     join public.rota_published_shifts shift
       on shift.id = assignment.rota_published_shift_id
     join public.rotas rota on rota.id = shift.rota_id
     join public.locations location on location.id = rota.location_id
     where rota.id = $1::uuid
       and rota.status = 'published'
     order by employee.full_name asc, shift.day_date asc, shift.start_time asc`,
    [rotaId]
  )

  return result.rows
}

async function listTimeEntriesForRotaWeek(input: {
  locationId: string
  organizationId: string | null
  weekStart: string
}) {
  const result = await getDatabase().query<TimeEntryRow>(
    `select
       entry.id,
       entry.employee_id,
       employee.full_name as employee_name,
       employee.payroll_id as employee_payroll_id,
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
     where entry.location_id = $1::uuid
       and coalesce(entry.scheduled_start_at, entry.clocked_in_at) >= $2::date
       and coalesce(entry.scheduled_start_at, entry.clocked_in_at) <
         ($2::date + interval '7 day')
       and (
         ($3::text is not null and entry.organization_id = $3::text)
         or ($3::text is null and entry.organization_id is null)
       )
     order by employee.full_name asc, entry.clocked_in_at asc`,
    [input.locationId, input.weekStart, input.organizationId]
  )

  return result.rows
}

export { getSageTimesheetExportData }
