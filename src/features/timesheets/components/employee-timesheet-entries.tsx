import { format, parseISO } from "date-fns"
import { CalendarDaysIcon } from "lucide-react"

import type { TimesheetDay, TimesheetEntry } from "@/features/timesheets/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  TimesheetPanel,
  TimesheetPanelHeader,
} from "@/features/timesheets/components/timesheet-panel"
import { TimesheetEntryBadge } from "@/features/timesheets/components/timesheet-status"
import {
  formatTimesheetDuration,
  getEntryClockLabel,
  getEntryScheduleLabel,
} from "@/features/timesheets/utils/timesheet-view"

type TimesheetEntryRow = {
  day: TimesheetDay
  entry: TimesheetEntry | null
  key: string
}

function EmployeeTimesheetEntries({ days }: { days: Array<TimesheetDay> }) {
  const rows = getEntryRows(days)

  return (
    <TimesheetPanel>
      <TimesheetPanelHeader
        icon={CalendarDaysIcon}
        subtitle="Clock records and payable time for the week"
        title="Your timesheet entries"
      />
      <div className="hidden md:block">
        <DesktopEntryTable rows={rows} />
      </div>
      <div className="divide-y divide-[#edf0f6] md:hidden">
        {rows.map((row) => (
          <MobileEntryRow key={row.key} row={row} />
        ))}
      </div>
    </TimesheetPanel>
  )
}

function DesktopEntryTable({ rows }: { rows: Array<TimesheetEntryRow> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-[#edf0f6] bg-[#fafbfe] hover:bg-[#fafbfe]">
          {[
            "Day",
            "Scheduled shift",
            "Clock record",
            "Location",
            "Worked",
            "Payable",
            "Status",
          ].map((label) => (
            <TableHead
              className="h-9 px-4 text-[11px] text-[#7481a0]"
              key={label}
            >
              {label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ day, entry, key }) => (
          <TableRow className="border-[#edf0f6] hover:bg-[#fafcff]" key={key}>
            <TableCell className="px-4 py-3 font-semibold">
              {day.dayLabel}{" "}
              <span className="text-[#7481a0]">{day.dateLabel}</span>
            </TableCell>
            <TableCell className="px-4 font-medium text-[#46577d]">
              {getEntryScheduleLabel(entry)}
            </TableCell>
            <TableCell className="px-4 font-medium text-[#46577d]">
              {getEntryClockLabel(entry)}
            </TableCell>
            <TableCell className="max-w-44 truncate px-4 font-medium text-[#68769a]">
              {entry?.locationName ?? "—"}
            </TableCell>
            <TableCell className="px-4 font-semibold">
              {formatTimesheetDuration(entry?.actualMinutes ?? 0)}
            </TableCell>
            <TableCell className="px-4 font-semibold">
              {formatTimesheetDuration(entry?.payableMinutes ?? 0)}
            </TableCell>
            <TableCell className="px-4">
              <TimesheetEntryBadge entry={entry} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function MobileEntryRow({ row }: { row: TimesheetEntryRow }) {
  const { day, entry } = row
  const date = parseISO(day.date)

  return (
    <div className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
      <div className="flex h-12 flex-col items-center justify-center rounded-lg border border-[#dfe4ef] bg-[#fafbfe]">
        <span className="text-[9px] font-bold tracking-[0.08em] text-[#236cff] uppercase">
          {day.dayLabel}
        </span>
        <span className="text-lg leading-none font-bold">
          {format(date, "d")}
        </span>
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-semibold">
            {getEntryScheduleLabel(entry)}
          </p>
          <TimesheetEntryBadge entry={entry} />
        </div>
        <p className="mt-1 truncate text-[11px] font-medium text-[#7481a0]">
          {getEntryClockLabel(entry)} · {entry?.locationName ?? "No shift"}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">
          {formatTimesheetDuration(entry?.payableMinutes ?? 0)}
        </p>
        <p className="mt-1 text-[10px] font-medium text-[#8792ad]">payable</p>
      </div>
    </div>
  )
}

function getEntryRows(days: Array<TimesheetDay>) {
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

export { EmployeeTimesheetEntries }
