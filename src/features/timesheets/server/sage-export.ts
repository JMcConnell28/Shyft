import type {
  SageTimesheetExportData,
  SageTimesheetExportInput,
} from "@/features/timesheets/types"
import { mapEntryRows } from "@/features/timesheets/server/entry-mapping"
import { resolveTimesheetAccess } from "@/features/timesheets/server/access"
import {
  listScheduledShifts,
  listTimeEntries,
} from "@/features/timesheets/server/week-records"
import {
  buildSageTimesheetExportData,
  getMissingPayrollEmployees,
  getUnresolvedEntryEmployees,
} from "@/features/timesheets/utils/sage-timesheet-export"
import {
  getTimesheetWeek,
  isTimesheetWeekComplete,
} from "@/features/timesheets/utils/timesheet-time"
import { getDatabase } from "@/lib/db"

type ExportLocationRow = {
  id: string
  name: string
  slug: string | null
}

async function getSageTimesheetExportData(
  input: SageTimesheetExportInput
): Promise<SageTimesheetExportData> {
  const scope = await resolveTimesheetAccess(input)

  if (!scope.canManage) {
    throw new Error("You do not have permission to export timesheets.")
  }

  if (!scope.locationIds.includes(input.exportLocationId)) {
    throw new Error("Choose a location you can manage.")
  }

  const week = getTimesheetWeek(input.weekStart)

  if (!isTimesheetWeekComplete(week.weekStart)) {
    throw new Error(
      "Sage exports are only available for completed timesheet weeks."
    )
  }

  const location = await getExportLocation(input.exportLocationId)
  const recordsInput = {
    employeeUserId: null,
    locationIds: [location.id],
    organizationId: scope.organizationId,
    weekStart: week.weekStart,
  }
  const [scheduledRows, entryRows] = await Promise.all([
    listScheduledShifts(recordsInput),
    listTimeEntries(recordsInput),
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
    locationName: location.name,
    locationSlug: location.slug,
    weekStart: week.weekStart,
  })
}

async function getExportLocation(
  locationId: string
): Promise<ExportLocationRow> {
  const result = await getDatabase().query<ExportLocationRow>(
    `select id, name, slug
     from public.locations
     where id = $1::uuid
     limit 1`,
    [locationId]
  )
  const location = result.rows.at(0)

  if (!location) {
    throw new Error("Choose a valid location.")
  }

  return location
}

export { getSageTimesheetExportData }
