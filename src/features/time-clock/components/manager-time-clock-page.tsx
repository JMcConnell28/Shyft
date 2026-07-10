"use client"

import * as React from "react"
import { addDays, format, isToday, parseISO } from "date-fns"
import { Link } from "@tanstack/react-router"
import {
  AlertTriangleIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ClipboardCheckIcon,
  TimerIcon,
  UserCheckIcon,
  UsersRoundIcon,
} from "lucide-react"
// eslint-disable-next-line no-duplicate-imports
import type { LucideIcon } from "lucide-react"

import type {
  ClockAction,
  ManagerClockPageData,
} from "@/features/time-clock/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MobileManagerTimeClockPage } from "@/features/time-clock/components/mobile-manager-time-clock-page"
import {
  TimeClockEmptyState,
  TimeClockPanel,
  TimeClockPanelHeader,
  TimeClockPill,
} from "@/features/time-clock/components/time-clock-panel"
import { useLiveNow } from "@/features/time-clock/hooks/use-live-now"
import { useManagerClockMutations } from "@/features/time-clock/hooks/use-time-clock-mutations"
import { useManagerClockQuery } from "@/features/time-clock/hooks/use-time-clock-query"
import {
  formatElapsedSummary,
  formatElapsedTime,
  getElapsedMilliseconds,
} from "@/features/time-clock/utils/elapsed-time"
import { getManagerClockStats } from "@/features/time-clock/utils/manager-clock-stats"

function ManagerTimeClockPage({
  date,
  initialData,
  organizationId,
  locationId,
  userId,
  workspaceSlug,
}: {
  date?: string
  initialData: ManagerClockPageData
  organizationId?: string
  locationId?: string
  userId: string
  workspaceSlug: string
}) {
  const input = { date, organizationId, locationId, userId }
  const query = useManagerClockQuery(input)
  const data = query.data ?? initialData
  const { approveAsRecordedMutation, overrideMutation } =
    useManagerClockMutations(input)
  const [selectedEmployeeKey, setSelectedEmployeeKey] = React.useState(
    getEmployeeKey(data.employees.at(0))
  )
  const [action, setAction] = React.useState<ClockAction>("clock_in")
  const [reason, setReason] = React.useState("")
  const liveNow = useLiveNow(
    data.employees.some((employee) => employee.openEntry)
  )
  const stats = getManagerClockStats(data, liveNow)
  const reviewCount = data.reviewEntries.length
  const failedCount = data.failedAttempts.length
  const selectedEmployee =
    data.employees.find(
      (employee) => getEmployeeKey(employee) === selectedEmployeeKey
    ) ??
    data.employees.at(0) ??
    null

  React.useEffect(() => {
    const firstEmployee = data.employees.at(0)

    if (!selectedEmployeeKey && firstEmployee) {
      setSelectedEmployeeKey(getEmployeeKey(firstEmployee))
    }
  }, [data.employees, selectedEmployeeKey])

  function applyOverride() {
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
      }
    )
  }

  return (
    <>
      <MobileManagerTimeClockPage
        action={action}
        data={data}
        isApplyingOverride={overrideMutation.isPending}
        liveNow={liveNow}
        onActionChange={setAction}
        onApplyOverride={applyOverride}
        onReasonChange={setReason}
        onSelectedEmployeeKeyChange={setSelectedEmployeeKey}
        reason={reason}
        selectedEmployee={selectedEmployee}
        selectedEmployeeKey={selectedEmployeeKey}
        stats={stats}
        workspaceSlug={workspaceSlug}
      />
      <div className="hidden flex-1 flex-col bg-[#f7f8fb] px-6 py-6 text-[#11245a] md:flex">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
          <TimeClockPanel>
            <div className="flex min-h-[7.5rem] items-center justify-between gap-5 px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.1em] text-[#7a86a4] uppercase">
                  Time tracking
                </p>
                <h1 className="mt-1 truncate text-2xl font-semibold tracking-[-0.02em] text-[#11245a]">
                  Clock activity
                </h1>
                <p className="mt-1 text-sm font-medium text-[#7a86a4]">
                  Monitor station taps, open entries, and manager reviews.
                </p>
              </div>
              <DesktopDateControls
                selectedDate={data.selectedDate}
                workspaceSlug={workspaceSlug}
              />
            </div>

            <div className="grid grid-cols-4 divide-x divide-[#edf0f6] border-t border-[#edf0f6] bg-[#fbfcff]">
              <ClockMetric
                icon={ClockIcon}
                label="Clocked in"
                value={String(stats.openCount)}
                description="Open now"
              />
              <ClockMetric
                icon={TimerIcon}
                label="Average active"
                value={formatElapsedSummary(stats.averageElapsedMs)}
                description="Current entries"
              />
              <ClockMetric
                icon={UserCheckIcon}
                label="Longest active"
                value={formatElapsedSummary(stats.longestElapsedMs)}
                description="Longest open"
              />
              <ClockMetric
                icon={AlertTriangleIcon}
                label="Review"
                value={String(stats.reviewCount)}
                description="Needs attention"
              />
            </div>
          </TimeClockPanel>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <TimeClockPanel>
              <TimeClockPanelHeader
                action={
                  <TimeClockPill>
                    {data.employees.length} employee
                    {data.employees.length === 1 ? "" : "s"}
                  </TimeClockPill>
                }
                icon={UsersRoundIcon}
                subtitle="Live clock status by assigned location"
                title="Team status"
              />
              <div className="space-y-2 p-4">
                {data.employees.length === 0 ? (
                  <TimeClockEmptyState>
                    No active team members are assigned to these locations.
                  </TimeClockEmptyState>
                ) : (
                  data.employees.map((employee) => (
                    <div
                      key={`${employee.id}:${employee.locationId}`}
                      className="flex flex-col gap-3 rounded-[12px] border border-[#dfe5f0] bg-white p-3 transition-colors hover:bg-[#fbfcff] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-[#11245a]">
                            {employee.name}
                          </p>
                          <Badge
                            variant={employee.openEntry ? "default" : "outline"}
                            className={
                              employee.openEntry
                                ? "rounded-[8px] bg-[#e7f8f1] px-2 py-0.5 text-[11px] font-semibold text-[#248964] hover:bg-[#e7f8f1]"
                                : "rounded-[8px] border-[#dfe5f0] bg-[#fbfcff] px-2 py-0.5 text-[11px] font-semibold text-[#61709a]"
                            }
                          >
                            {employee.openEntry ? "In" : "Out"}
                          </Badge>
                          {employee.openEntry?.isForgottenClockOutAlert ? (
                            <Badge
                              variant="destructive"
                              className="rounded-[8px] px-2 py-0.5 text-[11px] font-semibold"
                            >
                              Check clock-out
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs font-medium text-[#7a86a4]">
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
                        className="h-8 rounded-[9px] border-[#dfe5f0] bg-white px-3 text-xs font-semibold text-[#11245a] shadow-none hover:bg-[#fbfcff]"
                        onClick={() => {
                          setSelectedEmployeeKey(getEmployeeKey(employee))
                          setAction(
                            employee.openEntry ? "clock_out" : "clock_in"
                          )
                        }}
                      >
                        Override
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </TimeClockPanel>

            <TimeClockPanel>
              <TimeClockPanelHeader
                icon={ClipboardCheckIcon}
                subtitle="Record a correction when a station tap was missed"
                title="Manager override"
              />
              <div className="space-y-3 p-4">
                <label className="space-y-1 text-xs font-semibold text-[#7a86a4]">
                  <span>Team member</span>
                  <select
                    className="h-9 w-full rounded-[10px] border border-[#dfe5f0] bg-white px-3 text-sm font-medium text-[#11245a]"
                    value={
                      selectedEmployee ? getEmployeeKey(selectedEmployee) : ""
                    }
                    onChange={(event) =>
                      setSelectedEmployeeKey(event.target.value)
                    }
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

                <label className="space-y-1 text-xs font-semibold text-[#7a86a4]">
                  <span>Action</span>
                  <select
                    className="h-9 w-full rounded-[10px] border border-[#dfe5f0] bg-white px-3 text-sm font-medium text-[#11245a]"
                    value={action}
                    onChange={(event) =>
                      setAction(event.target.value as ClockAction)
                    }
                  >
                    <option value="clock_in">Clock in</option>
                    <option value="clock_out">Clock out</option>
                  </select>
                </label>

                <label className="space-y-1 text-xs font-semibold text-[#7a86a4]">
                  <span>Reason</span>
                  <Textarea
                    className="min-h-24 rounded-[10px] border-[#dfe5f0] bg-white text-sm text-[#11245a] shadow-none placeholder:text-[#9aa4bb]"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Missed station tap, manager correction..."
                  />
                </label>

                <Button
                  className="h-9 w-full rounded-[10px] text-sm font-semibold"
                  disabled={!selectedEmployee || reason.trim().length < 5}
                  onClick={applyOverride}
                >
                  Apply override
                </Button>
              </div>
            </TimeClockPanel>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ReviewCard
              count={reviewCount}
              data={data}
              isApproving={approveAsRecordedMutation.isPending}
              onApprove={(entryId) =>
                approveAsRecordedMutation.mutate({ entryId })
              }
            />
            <FailedAttemptsCard count={failedCount} data={data} />
          </div>
        </div>
      </div>
    </>
  )
}

function DesktopDateControls({
  selectedDate,
  workspaceSlug,
}: {
  selectedDate: string
  workspaceSlug: string
}) {
  const date = parseISO(selectedDate)
  const previousDate = format(addDays(date, -1), "yyyy-MM-dd")
  const nextDate = format(addDays(date, 1), "yyyy-MM-dd")

  return (
    <div className="grid grid-cols-[2.25rem_minmax(10rem,1fr)_2.25rem] items-center gap-2 rounded-[12px] border border-[#dfe5f0] bg-[#fbfcff] p-1.5">
      <DateNavButton
        date={previousDate}
        direction="previous"
        workspaceSlug={workspaceSlug}
      />
      <div className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-[#edf0f6] bg-white px-3 text-sm font-semibold text-[#11245a] shadow-[0_4px_12px_rgba(30,50,96,0.035)]">
        <CalendarDaysIcon className="size-4 text-[#0069ff]" />
        <span className="truncate">{formatDateChip(selectedDate)}</span>
      </div>
      <DateNavButton
        date={nextDate}
        direction="next"
        workspaceSlug={workspaceSlug}
      />
    </div>
  )
}

function DateNavButton({
  date,
  direction,
  workspaceSlug,
}: {
  date: string
  direction: "next" | "previous"
  workspaceSlug: string
}) {
  const Icon = direction === "previous" ? ChevronLeftIcon : ChevronRightIcon

  return (
    <Button
      variant="pill"
      size="icon"
      className="size-9 rounded-[10px] bg-white text-[#11245a] shadow-[0_4px_12px_rgba(30,50,96,0.035)] ring-1 ring-[#dfe5f0] hover:bg-[#fbfcff]"
      nativeButton={false}
      render={
        <Link
          to="/w/$workspaceSlug/time-clock"
          params={{ workspaceSlug }}
          search={{ date }}
        />
      }
    >
      <Icon className="size-4" />
      <span className="sr-only">
        {direction === "previous" ? "Previous day" : "Next day"}
      </span>
    </Button>
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
    <div className="min-w-0 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-[9px] bg-[#eef3ff] text-[#0069ff]">
          <Icon className="size-3.5" />
        </span>
        <p className="truncate text-xs font-semibold text-[#7a86a4]">{label}</p>
      </div>
      <p className="mt-2 truncate text-xl leading-none font-semibold tracking-[-0.02em] text-[#11245a]">
        {value}
      </p>
      <p className="mt-1 truncate text-xs font-medium text-[#7a86a4]">
        {description}
      </p>
    </div>
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
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-[#7a86a4]">
      <span>Since {formatDateTime(clockedInAt)}</span>
      <span className="rounded-[8px] border border-[#dfe5f0] bg-[#fbfcff] px-2 py-1 font-mono font-semibold text-[#11245a]">
        {formatElapsedTime(elapsedMs)}
      </span>
      {scheduledEndAt ? (
        <span>Ends {formatDateTime(scheduledEndAt)}</span>
      ) : null}
    </div>
  )
}

function ReviewCard({
  count,
  data,
  isApproving,
  onApprove,
}: {
  count: number
  data: ManagerClockPageData
  isApproving: boolean
  onApprove: (entryId: string) => void
}) {
  return (
    <TimeClockPanel>
      <TimeClockPanelHeader
        action={
          <TimeClockPill>
            {count} item{count === 1 ? "" : "s"}
          </TimeClockPill>
        }
        icon={CheckCircle2Icon}
        title="Needs review"
      />
      <div className="space-y-2 p-4">
        {data.reviewEntries.length === 0 ? (
          <TimeClockEmptyState>No entries need review.</TimeClockEmptyState>
        ) : (
          data.reviewEntries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-[12px] border border-[#dfe5f0] bg-white p-3"
            >
              <p className="font-semibold text-[#11245a]">
                {entry.employeeName}
              </p>
              <p className="mt-1 text-xs font-medium text-[#7a86a4]">
                In {formatDateTime(entry.clockedInAt)}
                {entry.clockedOutAt
                  ? `, out ${formatDateTime(entry.clockedOutAt)}`
                  : ""}
              </p>
              <Button
                className="mt-3 h-8 rounded-[9px] border-[#dfe5f0] bg-white px-3 text-xs font-semibold text-[#11245a] shadow-none hover:bg-[#fbfcff]"
                disabled={isApproving}
                size="sm"
                variant="outline"
                onClick={() => onApprove(entry.id)}
              >
                Approve as recorded
              </Button>
            </div>
          ))
        )}
      </div>
    </TimeClockPanel>
  )
}

function FailedAttemptsCard({
  count,
  data,
}: {
  count: number
  data: ManagerClockPageData
}) {
  return (
    <TimeClockPanel>
      <TimeClockPanelHeader
        action={
          <TimeClockPill>
            {count} attempt{count === 1 ? "" : "s"}
          </TimeClockPill>
        }
        icon={AlertTriangleIcon}
        title="Failed attempts"
      />
      <div className="space-y-2 p-4">
        {data.failedAttempts.length === 0 ? (
          <TimeClockEmptyState>No recent failed attempts.</TimeClockEmptyState>
        ) : (
          data.failedAttempts.map((attempt) => (
            <div
              key={attempt.id}
              className="rounded-[12px] border border-[#dfe5f0] bg-white p-3"
            >
              <p className="font-semibold text-[#11245a]">
                {attempt.employeeName ?? "Unknown employee"}
              </p>
              <p className="mt-1 text-xs font-medium text-[#7a86a4]">
                {attempt.failureReason ?? "Attempt failed."}
              </p>
              <p className="mt-1 text-xs font-medium text-[#7a86a4]">
                {formatDateTime(attempt.createdAt)}
              </p>
            </div>
          ))
        )}
      </div>
    </TimeClockPanel>
  )
}

function formatDateChip(value: string) {
  const date = parseISO(value)

  if (isToday(date)) {
    return `Today ${format(date, "d MMM")}`
  }

  return format(date, "EEE d MMM")
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
  employee: ManagerClockPageData["employees"][number] | undefined
) {
  return employee ? `${employee.locationId}:${employee.id}` : ""
}

export { ManagerTimeClockPage }
