"use client"

import * as React from "react"
import { PencilIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EditTimesheetEntryDialog } from "@/features/timesheets/components/edit-timesheet-entry-dialog"
import type {
  ManagerTimesheet,
  TimesheetDay,
  TimesheetEntry,
  TimesheetScopeInput,
} from "@/features/timesheets/types"
import {
  formatHours,
  formatTime,
} from "@/features/timesheets/utils/timesheet-time"

function ManagerTimesheetTable({
  input,
  timesheet,
}: {
  input: TimesheetScopeInput
  timesheet: ManagerTimesheet
}) {
  const [selectedEntry, setSelectedEntry] = React.useState<TimesheetEntry | null>(
    null,
  )

  return (
    <>
      <Card className="hidden border-border/70 shadow-sm lg:block">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm">Team hours</CardTitle>
            <Badge variant="outline">
              {formatHours(timesheet.payableMinutes)} payable
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-48">Employee</TableHead>
                {timesheet.employees[0]?.days.map((day) => (
                  <TableHead key={day.date} className="min-w-36 text-center">
                    <span className="block">{day.dayLabel}</span>
                    <span className="text-muted-foreground">{day.dateLabel}</span>
                  </TableHead>
                ))}
                <TableHead className="text-right">Payable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timesheet.employees.map((employee) => (
                <TableRow key={employee.employeeId}>
                  <TableCell className="align-top">
                    <p className="font-medium">{employee.employeeName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {employee.locations.join(", ") || "No location"}
                    </p>
                  </TableCell>
                  {employee.days.map((day) => (
                    <TableCell key={day.date} className="align-top">
                      <DayCell day={day} onEdit={setSelectedEntry} />
                    </TableCell>
                  ))}
                  <TableCell className="text-right align-top font-semibold">
                    {formatHours(employee.payableMinutes)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="space-y-3 lg:hidden">
        {timesheet.employees.map((employee) => (
          <Card key={employee.employeeId} className="border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm">{employee.employeeName}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {employee.locations.join(", ") || "No location"}
                  </p>
                </div>
                <Badge variant="outline">
                  {formatHours(employee.payableMinutes)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {employee.days.map((day) => (
                <div key={day.date} className="rounded-lg border border-border/70 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {day.dayLabel} {day.dateLabel}
                    </p>
                    <Badge variant="outline">{formatHours(day.payableMinutes)}</Badge>
                  </div>
                  <DayCell day={day} onEdit={setSelectedEntry} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <EditTimesheetEntryDialog
        entry={selectedEntry}
        input={input}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEntry(null)
          }
        }}
      />
    </>
  )
}

function DayCell({
  day,
  onEdit,
}: {
  day: TimesheetDay
  onEdit: (entry: TimesheetEntry) => void
}) {
  if (day.entries.length === 0) {
    return <p className="text-center text-xs text-muted-foreground">-</p>
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1 text-center text-[11px]">
        <CellMetric label="Sch" value={formatHours(day.scheduledMinutes)} />
        <CellMetric label="Act" value={formatHours(day.actualMinutes)} />
        <CellMetric label="Pay" value={formatHours(day.payableMinutes)} />
      </div>
      <div className="space-y-1">
        {day.entries.map((entry, index) => (
          <EntryButton
            key={entry.id ?? `${day.date}:${index}`}
            entry={entry}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  )
}

function CellMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/30 px-1.5 py-1">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function EntryButton({
  entry,
  onEdit,
}: {
  entry: TimesheetEntry
  onEdit: (entry: TimesheetEntry) => void
}) {
  const isEditable = Boolean(entry.id)

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-auto w-full justify-between gap-2 px-2 py-1.5 text-left"
      disabled={!isEditable}
      onClick={() => onEdit(entry)}
    >
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium">
          {entry.zoneName ?? "Unmatched"}
        </span>
        <span className="block text-[11px] text-muted-foreground">
          {entry.clockedInAt
            ? `${formatTime(entry.clockedInAt)} - ${formatTime(entry.clockedOutAt)}`
            : `${formatTime(entry.scheduledStartAt)} - ${formatTime(
                entry.scheduledEndAt,
              )}`}
        </span>
      </span>
      {entry.status === "requires_review" ? (
        <Badge variant="destructive">Review</Badge>
      ) : entry.status === "open" ? (
        <Badge>Open</Badge>
      ) : isEditable ? (
        <PencilIcon className="size-3.5 shrink-0 text-muted-foreground" />
      ) : (
        <Badge variant="outline">Scheduled</Badge>
      )}
    </Button>
  )
}

export { ManagerTimesheetTable }
