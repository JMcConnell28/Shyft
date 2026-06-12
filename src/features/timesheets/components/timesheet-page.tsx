"use client"

import { addDays, format, parseISO } from "date-fns"
import { Link } from "@tanstack/react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmployeeTimesheetCards } from "@/features/timesheets/components/employee-timesheet-cards"
import { ManagerTimesheetTable } from "@/features/timesheets/components/manager-timesheet-table"
import { useTimesheetQuery } from "@/features/timesheets/hooks/use-timesheet-query"
import type {
  TimesheetScopeInput,
} from "@/features/timesheets/types"
import { formatHours } from "@/features/timesheets/utils/timesheet-time"

function TimesheetPage({
  input,
  workspaceSlug,
}: {
  input: TimesheetScopeInput
  workspaceSlug: string
}) {
  const query = useTimesheetQuery(input)

  if (query.isPending) {
    return (
      <div className="flex flex-1 flex-col gap-5 p-4 sm:p-5">
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  const data = query.data

  if (!data) {
    return (
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-5 text-sm text-muted-foreground">
            No timesheet data is available yet.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-5 text-sm text-muted-foreground">
            We could not load timesheets.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 sm:p-5">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Timesheets</h2>
            <p className="text-sm text-muted-foreground">{data.weekLabel}</p>
          </div>
          <WeekControls
            weekStart={data.weekStart}
            workspaceSlug={workspaceSlug}
          />
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardContent className="grid gap-3 sm:grid-cols-4">
            <Metric label="Scheduled" value={formatHours(data.employeeTimesheet.scheduledMinutes)} />
            <Metric label="Worked" value={formatHours(data.employeeTimesheet.actualMinutes)} />
            <Metric label="Payable" value={formatHours(data.employeeTimesheet.payableMinutes)} />
            <Metric
              label="Review"
              value={String(data.employeeTimesheet.reviewCount)}
            />
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Your week</h3>
          <Badge variant="outline">
            {data.employeeTimesheet.employeeName}
          </Badge>
        </div>
        <EmployeeTimesheetCards timesheet={data.employeeTimesheet} />
      </section>

      {data.canManage && data.managerTimesheet ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Team week</h3>
            <Badge variant="outline">
              {data.managerTimesheet.employees.length} employees
            </Badge>
          </div>
          <ManagerTimesheetTable input={input} timesheet={data.managerTimesheet} />
        </section>
      ) : null}
    </div>
  )
}

function WeekControls({
  weekStart,
  workspaceSlug,
}: {
  weekStart: string
  workspaceSlug: string
}) {
  const current = parseISO(weekStart)
  const previousWeek = format(addDays(current, -7), "yyyy-MM-dd")
  const nextWeek = format(addDays(current, 7), "yyyy-MM-dd")

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex">
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={
          <Link
            to="/w/$workspaceSlug/timesheets"
            params={{ workspaceSlug }}
            search={{ weekStart: previousWeek }}
          />
        }
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={
          <Link
            to="/w/$workspaceSlug/timesheets"
            params={{ workspaceSlug }}
            search={{ weekStart: nextWeek }}
          />
        }
      >
        Next
      </Button>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/20 px-3 py-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  )
}

export { TimesheetPage }
