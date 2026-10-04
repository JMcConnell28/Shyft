import type {
  TimesheetDay,
  TimesheetEntryRow,
} from "@/features/timesheets/types"

function getTimesheetEntryRows(
  days: Array<TimesheetDay>
): Array<TimesheetEntryRow> {
  return days.flatMap<TimesheetEntryRow>((day) =>
    day.entries.length === 0
      ? [{ day, entry: null, key: day.date }]
      : day.entries.map((entry, index) => ({
          day,
          entry,
          key: entry.id ?? `${day.date}:${index}`,
        }))
  )
}

export { getTimesheetEntryRows }
