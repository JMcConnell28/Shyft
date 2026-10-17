import type {
  ManagerTimesheet,
  TimesheetEntry,
} from "@/features/timesheets/types"

function findEditableTimesheetEntry(
  timesheet: ManagerTimesheet,
  entryId: string | undefined,
  writableLocationIds: Array<string>
): TimesheetEntry | null {
  if (!entryId) return null
  for (const employee of timesheet.employees) {
    for (const day of employee.days) {
      const entry = day.entries.find(
        (item) =>
          item.id === entryId && writableLocationIds.includes(item.locationId)
      )
      if (entry) return entry
    }
  }
  return null
}
export { findEditableTimesheetEntry }
