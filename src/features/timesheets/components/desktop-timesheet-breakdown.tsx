import { CalendarDaysIcon } from "lucide-react"

import type { TimesheetDay, TimesheetEntry } from "@/features/timesheets/types"
import {
  DesktopTimesheetPanel,
  DesktopTimesheetPanelHeader,
  DesktopTimesheetPill,
} from "@/features/timesheets/components/desktop-timesheet-panel"
import {
  formatHours,
  formatTime,
} from "@/features/timesheets/utils/timesheet-time"
import { cn } from "@/lib/utils"

function DesktopTimesheetBreakdown({
  days,
  totalPayableMinutes,
}: {
  days: TimesheetDay[]
  totalPayableMinutes: number
}) {
  return (
    <DesktopTimesheetPanel>
      <DesktopTimesheetPanelHeader
        action={
          <DesktopTimesheetPill className="bg-[#e7f8f1] text-[#248964]">
            {formatHours(totalPayableMinutes)}
            <span>payable</span>
          </DesktopTimesheetPill>
        }
        icon={CalendarDaysIcon}
        subtitle="Scheduled, worked and payable hours by day"
        title="Weekly breakdown"
      />

      <div className="p-4">
        <div className="overflow-hidden rounded-[12px] border border-[#dfe5f0] bg-white">
          <div className="grid grid-cols-[6.5rem_minmax(0,1.5fr)_minmax(10rem,1fr)_7rem_7rem] bg-[#fbfcff] px-4 py-2.5 text-[11px] font-semibold tracking-[0.08em] text-[#7a86a4] uppercase">
            <span>Day</span>
            <span>Shift</span>
            <span>Location</span>
            <span className="text-right">Hours</span>
            <span className="text-right">Payable</span>
          </div>
          <div className="divide-y divide-[#edf0f6]">
            {days.map((day) =>
              day.entries.length === 0 ? (
                <BreakdownRow key={day.date} day={day} entry={null} />
              ) : (
                day.entries.map((entry, index) => (
                  <BreakdownRow
                    key={entry.id ?? `${day.date}:${index}`}
                    day={day}
                    entry={entry}
                  />
                ))
              )
            )}
          </div>
        </div>
      </div>
    </DesktopTimesheetPanel>
  )
}

function BreakdownRow({
  day,
  entry,
}: {
  day: TimesheetDay
  entry: TimesheetEntry | null
}) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1.5fr)_minmax(10rem,1fr)_7rem_7rem] items-center px-4 py-3 text-sm transition-colors hover:bg-[#fbfcff]">
      <div className="font-semibold">
        <span className="text-[#7a86a4]">{day.dayLabel}</span>{" "}
        <span className="text-[#11245a]">{day.dateLabel}</span>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "size-2 shrink-0 rounded-full",
            getEntryDotClassName(entry)
          )}
        />
        <span className="truncate font-semibold text-[#11245a]">
          {getEntryTimeLabel(entry)}
        </span>
        {entry?.zoneName ? (
          <span className="shrink-0 rounded-[8px] bg-[#eef3ff] px-2 py-1 text-[11px] font-semibold text-[#0069ff]">
            {entry.zoneName}
          </span>
        ) : null}
      </div>
      <span className="truncate font-medium text-[#7a86a4]">
        {entry?.locationName ?? "-"}
      </span>
      <span className="text-right font-semibold text-[#11245a]">
        {formatHours(entry?.actualMinutes ?? 0)}
      </span>
      <span className="text-right font-semibold text-[#11245a]">
        {formatHours(entry?.payableMinutes ?? 0)}
      </span>
    </div>
  )
}

function getEntryTimeLabel(entry: TimesheetEntry | null) {
  if (!entry) {
    return "-"
  }

  if (entry.scheduledStartAt) {
    return `${formatTime(entry.scheduledStartAt)} - ${formatTime(
      entry.scheduledEndAt
    )}`
  }

  if (entry.clockedInAt) {
    return `${formatTime(entry.clockedInAt)} - ${formatTime(entry.clockedOutAt)}`
  }

  return "No scheduled shift"
}

function getEntryDotClassName(entry: TimesheetEntry | null) {
  if (!entry) {
    return "bg-[#c5ccdc]"
  }

  if (entry.status === "requires_review" || entry.status === "open") {
    return "bg-amber-500"
  }

  if (entry.status === "scheduled") {
    return "bg-[#0069ff]"
  }

  return "bg-[#00a84f]"
}

export { DesktopTimesheetBreakdown }
