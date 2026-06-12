"use client"

import { ClockIcon, MapPinIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EmployeeTimesheet, TimesheetEntry } from "@/features/timesheets/types"
import {
  formatDateTime,
  formatHours,
  formatTime,
} from "@/features/timesheets/utils/timesheet-time"

function EmployeeTimesheetCards({
  timesheet,
}: {
  timesheet: EmployeeTimesheet
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Scheduled" value={formatHours(timesheet.scheduledMinutes)} />
        <SummaryCard label="Worked" value={formatHours(timesheet.actualMinutes)} />
        <SummaryCard label="Payable" value={formatHours(timesheet.payableMinutes)} />
      </div>

      <div className="space-y-3">
        {timesheet.days.map((day) => (
          <Card key={day.date} className="border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm">{day.dayLabel}</CardTitle>
                  <p className="text-xs text-muted-foreground">{day.dateLabel}</p>
                </div>
                <Badge variant="outline">{formatHours(day.payableMinutes)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {day.entries.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border/70 bg-muted/10 p-3 text-sm text-muted-foreground">
                  No scheduled or clocked time.
                </p>
              ) : (
                day.entries.map((entry, index) => (
                  <TimesheetEntryCard
                    key={entry.id ?? `${day.date}:${index}`}
                    entry={entry}
                  />
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background px-3 py-2.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  )
}

function TimesheetEntryCard({ entry }: { entry: TimesheetEntry }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium">{entry.zoneName ?? "Unmatched time"}</p>
        <EntryStatusBadge entry={entry} />
      </div>

      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <MapPinIcon className="size-3.5" />
          {entry.locationName}
        </p>
        <p className="flex items-center gap-1.5">
          <ClockIcon className="size-3.5" />
          {entry.scheduledStartAt
            ? `${formatTime(entry.scheduledStartAt)} - ${formatTime(
                entry.scheduledEndAt,
              )}`
            : "No scheduled shift"}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <TimeMetric label="Actual" value={formatHours(entry.actualMinutes)} />
        <TimeMetric label="Payable" value={formatHours(entry.payableMinutes)} />
        <TimeMetric label="Scheduled" value={formatHours(entry.scheduledMinutes)} />
      </div>

      {entry.clockedInAt ? (
        <p className="mt-3 text-xs text-muted-foreground">
          In {formatDateTime(entry.clockedInAt)}
          {entry.clockedOutAt ? `, out ${formatDateTime(entry.clockedOutAt)}` : ""}
        </p>
      ) : null}
    </div>
  )
}

function TimeMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/30 px-2 py-1.5">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  )
}

function EntryStatusBadge({ entry }: { entry: TimesheetEntry }) {
  if (entry.status === "requires_review") {
    return <Badge variant="destructive">Review</Badge>
  }

  if (entry.status === "open") {
    return <Badge>Open</Badge>
  }

  if (entry.status === "scheduled") {
    return <Badge variant="outline">Scheduled</Badge>
  }

  return <Badge variant="outline">Closed</Badge>
}

export { EmployeeTimesheetCards }
