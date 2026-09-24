import { PencilIcon } from "lucide-react"

import type {
  ManagerTimesheetEmployee,
  TimesheetEntry,
} from "@/features/timesheets/types"
import { TimesheetEntryBadge } from "@/features/timesheets/components/timesheet-status"
import {
  formatTimesheetDuration,
  getEntryClockLabel,
  getEntryScheduleLabel,
} from "@/features/timesheets/utils/timesheet-view"
import { cn } from "@/lib/utils"

function EmployeeWeekDetails({
  canEditEntry,
  employee,
  onEdit,
}: {
  canEditEntry: (entry: TimesheetEntry) => boolean
  employee: ManagerTimesheetEmployee
  onEdit: (entry: TimesheetEntry) => void
}) {
  const rows = employee.days.flatMap((day) =>
    day.entries.map((entry, index) => ({
      day,
      entry,
      key: entry.id ?? `${day.date}:${index}`,
    }))
  )

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[#dfe4ef] bg-white px-4 py-6 text-center text-sm font-medium text-[#7481a0]">
        No scheduled or clocked entries for this week.
      </p>
    )
  }

  return (
    <div className="grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
      {rows.map(({ day, entry, key }) => (
        <button
          className={cn(
            "flex min-w-0 items-center gap-3 rounded-xl border border-[#dfe4ef] bg-white p-3 text-left transition-colors",
            entry.id && canEditEntry(entry)
              ? "hover:border-[#b8c9ee] hover:bg-blue-50/30"
              : "cursor-default"
          )}
          disabled={!entry.id || !canEditEntry(entry)}
          key={key}
          onClick={() => onEdit(entry)}
          type="button"
        >
          <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-[#eef3ff] text-[#236cff]">
            <span className="text-[9px] font-bold uppercase">
              {day.dayLabel}
            </span>
            <span className="text-xs font-bold">
              {day.dateLabel.split(" ")[0]}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-xs font-semibold">
                {getEntryScheduleLabel(entry)}
              </p>
              <TimesheetEntryBadge entry={entry} />
            </div>
            <p className="mt-1 truncate text-[10px] font-medium text-[#7481a0]">
              {getEntryClockLabel(entry)} · {entry.locationName}
            </p>
          </div>
          <div className="ml-auto shrink-0 text-right">
            <p className="text-xs font-semibold">
              {formatTimesheetDuration(entry.payableMinutes)}
            </p>
            {entry.id ? (
              <PencilIcon className="mt-1 ml-auto size-3 text-[#236cff]" />
            ) : null}
          </div>
        </button>
      ))}
    </div>
  )
}

export { EmployeeWeekDetails }
