"use client"

import * as React from "react"
import {
  AlertTriangleIcon,
  ClockIcon,
  TimerIcon,
  UserCheckIcon,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useLiveNow } from "@/features/time-clock/hooks/use-live-now"
import { useManagerClockMutations } from "@/features/time-clock/hooks/use-time-clock-mutations"
import { useManagerClockQuery } from "@/features/time-clock/hooks/use-time-clock-query"
import type { ClockAction, ManagerClockPageData } from "@/features/time-clock/types"
import {
  formatElapsedSummary,
  formatElapsedTime,
  getElapsedMilliseconds,
} from "@/features/time-clock/utils/elapsed-time"
import { getManagerClockStats } from "@/features/time-clock/utils/manager-clock-stats"

function ManagerTimeClockPage({
  initialData,
  organizationId,
  locationId,
  userId,
}: {
  initialData: ManagerClockPageData
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const input = { organizationId, locationId, userId }
  const query = useManagerClockQuery(input)
  const data = query.data ?? initialData
  const { overrideMutation } = useManagerClockMutations(input)
  const [selectedEmployeeKey, setSelectedEmployeeKey] = React.useState(
    getEmployeeKey(data.employees[0]),
  )
  const [action, setAction] = React.useState<ClockAction>("clock_in")
  const [reason, setReason] = React.useState("")
  const liveNow = useLiveNow(data.employees.some((employee) => employee.openEntry))
  const stats = getManagerClockStats(data, liveNow)
  const selectedEmployee =
    data.employees.find(
      (employee) => getEmployeeKey(employee) === selectedEmployeeKey,
    ) ??
    data.employees[0] ??
    null

  React.useEffect(() => {
    if (!selectedEmployeeKey && data.employees[0]) {
      setSelectedEmployeeKey(getEmployeeKey(data.employees[0]))
    }
  }, [data.employees, selectedEmployeeKey])

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 sm:p-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold tracking-tight">Time clock</h2>
        <p className="text-sm text-muted-foreground">
          Monitor clocked-in staff and apply manager overrides.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ClockMetric
          icon={ClockIcon}
          label="Clocked in"
          value={String(stats.openCount)}
          description="Open entries right now"
        />
        <ClockMetric
          icon={TimerIcon}
          label="Average active"
          value={formatElapsedSummary(stats.averageElapsedMs)}
          description="Across clocked-in staff"
        />
        <ClockMetric
          icon={UserCheckIcon}
          label="Longest active"
          value={formatElapsedSummary(stats.longestElapsedMs)}
          description="Current longest open entry"
        />
        <ClockMetric
          icon={AlertTriangleIcon}
          label="Review"
          value={String(stats.reviewCount)}
          description="Unmatched or flagged entries"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="border-border/70 bg-background/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">Team status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.employees.length === 0 ? (
              <p className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                No active team members are assigned to these locations.
              </p>
            ) : (
              data.employees.map((employee) => (
                <div
                  key={`${employee.id}:${employee.locationId}`}
                  className="flex flex-col gap-3 rounded-xl border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{employee.name}</p>
                      <Badge variant={employee.openEntry ? "default" : "outline"}>
                        {employee.openEntry ? "In" : "Out"}
                      </Badge>
                      {employee.openEntry?.isForgottenClockOutAlert ? (
                        <Badge variant="destructive">Check clock-out</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {employee.locationName}
                      {employee.email ? ` - ${employee.email}` : ""}
                    </p>
                    {employee.openEntry ? (
                      <OpenEntryTimer
                        clockedInAt={employee.openEntry.clockedInAt}
                        scheduledEndAt={employee.openEntry.scheduledEndAt}
                        now={liveNow}
                      />
                    ) : null}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedEmployeeKey(getEmployeeKey(employee))
                      setAction(employee.openEntry ? "clock_out" : "clock_in")
                    }}
                  >
                    Override
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">Manager override</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="space-y-1 text-xs font-medium">
              <span>Team member</span>
              <select
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={selectedEmployee ? getEmployeeKey(selectedEmployee) : ""}
                onChange={(event) => setSelectedEmployeeKey(event.target.value)}
              >
                {data.employees.map((employee) => (
                  <option
                    key={`${employee.id}:${employee.locationId}`}
                    value={getEmployeeKey(employee)}
                  >
                    {employee.name} - {employee.locationName}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-xs font-medium">
              <span>Action</span>
              <select
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={action}
                onChange={(event) =>
                  setAction(event.target.value as ClockAction)
                }
              >
                <option value="clock_in">Clock in</option>
                <option value="clock_out">Clock out</option>
              </select>
            </label>

            <label className="space-y-1 text-xs font-medium">
              <span>Reason</span>
              <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Forgot phone, NFC issue, manager correction..."
              />
            </label>

            <Button
              className="w-full"
              disabled={!selectedEmployee || reason.trim().length < 5}
              onClick={() => {
                if (!selectedEmployee) {
                  return
                }

                overrideMutation.mutate(
                  {
                    action,
                    employeeId: selectedEmployee.id,
                    locationId: selectedEmployee.locationId,
                    reason,
                  },
                  {
                    onSuccess: () => setReason(""),
                  },
                )
              }}
            >
              Apply override
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ReviewCard data={data} />
        <FailedAttemptsCard data={data} />
      </div>
    </div>
  )
}

function ClockMetric({
  description,
  icon: Icon,
  label,
  value,
}: {
  description: string
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardContent className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg border border-border/70 text-muted-foreground">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {label}
          </p>
          <p className="text-lg font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function OpenEntryTimer({
  clockedInAt,
  now,
  scheduledEndAt,
}: {
  clockedInAt: string
  now: Date
  scheduledEndAt: string | null
}) {
  const elapsedMs = getElapsedMilliseconds(clockedInAt, now)

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span>Since {formatDateTime(clockedInAt)}</span>
      <span className="rounded-md border border-border/70 bg-muted/20 px-2 py-1 font-mono text-foreground">
        {formatElapsedTime(elapsedMs)}
      </span>
      {scheduledEndAt ? <span>Ends {formatDateTime(scheduledEndAt)}</span> : null}
    </div>
  )
}

function ReviewCard({ data }: { data: ManagerClockPageData }) {
  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm">Needs review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.reviewEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No entries need review.</p>
        ) : (
          data.reviewEntries.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-border/70 p-3">
              <p className="font-medium">{entry.employeeName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                In {formatDateTime(entry.clockedInAt)}
                {entry.clockedOutAt
                  ? `, out ${formatDateTime(entry.clockedOutAt)}`
                  : ""}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function FailedAttemptsCard({ data }: { data: ManagerClockPageData }) {
  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm">Failed attempts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.failedAttempts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent failed attempts.</p>
        ) : (
          data.failedAttempts.map((attempt) => (
            <div
              key={attempt.id}
              className="rounded-xl border border-border/70 p-3"
            >
              <p className="font-medium">
                {attempt.employeeName ?? "Unknown employee"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {attempt.failureReason ?? "Attempt failed."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDateTime(attempt.createdAt)}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value))
}

function getEmployeeKey(
  employee: ManagerClockPageData["employees"][number] | undefined,
) {
  return employee ? `${employee.locationId}:${employee.id}` : ""
}

export { ManagerTimeClockPage }
