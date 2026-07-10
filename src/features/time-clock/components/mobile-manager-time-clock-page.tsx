"use client"

import { addDays, format, isToday, parseISO } from "date-fns"
import { Link } from "@tanstack/react-router"
import {
  AlertTriangleIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Clock3Icon,
  FilePenLineIcon,
  LogInIcon,
  LogOutIcon,
  UserRoundIcon,
} from "lucide-react"

import type {
  ClockAction,
  ManagerClockActivityEntry,
  ManagerClockEmployee,
  ManagerClockPageData,
} from "@/features/time-clock/types"
import type { ManagerClockStats } from "@/features/time-clock/utils/manager-clock-stats"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  formatElapsedSummary,
  getElapsedMilliseconds,
} from "@/features/time-clock/utils/elapsed-time"
import { cn } from "@/lib/utils"

type MobileManagerTimeClockPageProps = {
  action: ClockAction
  data: ManagerClockPageData
  isApplyingOverride: boolean
  liveNow: Date
  onActionChange: (action: ClockAction) => void
  onApplyOverride: () => void
  onReasonChange: (reason: string) => void
  onSelectedEmployeeKeyChange: (key: string) => void
  reason: string
  selectedEmployee: ManagerClockEmployee | null
  selectedEmployeeKey: string
  stats: ManagerClockStats
  workspaceSlug: string
}

function MobileManagerTimeClockPage({
  action,
  data,
  isApplyingOverride,
  liveNow,
  onActionChange,
  onApplyOverride,
  onReasonChange,
  onSelectedEmployeeKeyChange,
  reason,
  selectedEmployee,
  selectedEmployeeKey,
  stats,
  workspaceSlug,
}: MobileManagerTimeClockPageProps) {
  const failedTodayCount = data.failedAttempts.filter((attempt) =>
    attempt.createdAt.startsWith(data.selectedDate)
  ).length
  const flaggedCount = data.activityEntries.filter(
    (entry) =>
      entry.status === "requires_review" || entry.isForgottenClockOutAlert
  ).length

  return (
    <div className="flex flex-1 flex-col bg-[#f7f8fb] px-4 pt-2 pb-[max(2rem,env(safe-area-inset-bottom))] text-[#11245a] md:hidden">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <MobileTimeClockHero />
        <MobileDateControls
          selectedDate={data.selectedDate}
          workspaceSlug={workspaceSlug}
        />

        <section className="grid grid-cols-3 divide-x divide-[#e4e8f0] rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
          <MobileClockMetric
            icon={Clock3Icon}
            label="Clocked in"
            value={String(stats.openCount)}
            tone="green"
          />
          <MobileClockMetric
            icon={AlertTriangleIcon}
            label="Review"
            value={String(flaggedCount)}
            tone="orange"
          />
          <MobileClockMetric
            icon={UserRoundIcon}
            label="Failed"
            value={String(failedTodayCount)}
            tone="blue"
          />
        </section>

        <MobileQuickActions
          onActionChange={onActionChange}
          workspaceSlug={workspaceSlug}
        />

        <MobileActivityList
          entries={data.activityEntries}
          liveNow={liveNow}
          selectedDate={data.selectedDate}
        />

        <MobileManualActions
          action={action}
          employees={data.employees}
          isApplyingOverride={isApplyingOverride}
          onActionChange={onActionChange}
          onApplyOverride={onApplyOverride}
          onReasonChange={onReasonChange}
          onSelectedEmployeeKeyChange={onSelectedEmployeeKeyChange}
          reason={reason}
          selectedEmployee={selectedEmployee}
          selectedEmployeeKey={selectedEmployeeKey}
        />
      </div>
    </div>
  )
}

function MobileTimeClockHero() {
  return (
    <section className="animate-in pt-1 duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
      <h1 className="text-[2rem] leading-none font-extrabold tracking-[-0.055em]">
        Time clock
      </h1>
      <p className="mt-2 text-sm font-semibold text-[#61709a]">
        Review clock activity and manage staff attendance.
      </p>
    </section>
  )
}

function MobileDateControls({
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
    <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-3 rounded-xl bg-white p-3 shadow-[0_6px_18px_rgba(30,50,96,0.055)] ring-1 ring-[#e7eaf2]">
      <DateNavButton
        date={previousDate}
        direction="previous"
        workspaceSlug={workspaceSlug}
      />
      <div className="mx-auto inline-flex h-10 max-w-full items-center gap-2 rounded-xl border border-[#dfe5f0] bg-white px-4 text-sm font-extrabold text-[#11245a] shadow-[0_4px_12px_rgba(30,50,96,0.045)]">
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
      className="size-10 rounded-xl bg-white text-[#11245a] shadow-[0_4px_12px_rgba(30,50,96,0.045)] ring-1 ring-[#dfe5f0] hover:bg-white"
      nativeButton={false}
      render={
        <Link
          to="/w/$workspaceSlug/time-clock"
          params={{ workspaceSlug }}
          search={{ date }}
        />
      }
    >
      <Icon className="size-5" />
      <span className="sr-only">
        {direction === "previous" ? "Previous day" : "Next day"}
      </span>
    </Button>
  )
}

function MobileClockMetric({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: typeof Clock3Icon
  label: string
  tone: "blue" | "green" | "orange"
  value: string
}) {
  const toneClassName = {
    blue: "bg-[#eef3ff] text-[#0069ff]",
    green: "bg-[#e1f8eb] text-[#00a84f]",
    orange: "bg-[#fff4df] text-[#f59f00]",
  }[tone]

  return (
    <div className="min-w-0 px-2 first:pl-0 last:pr-0">
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-xl",
          toneClassName
        )}
      >
        <Icon className="size-4" />
      </span>
      <p className="mt-2 truncate text-xs font-semibold text-[#61709a]">
        {label}
      </p>
      <p className="mt-1 text-[1.65rem] leading-none font-extrabold tracking-[-0.055em]">
        {value}
      </p>
    </div>
  )
}

function MobileQuickActions({
  onActionChange,
  workspaceSlug,
}: {
  onActionChange: (action: ClockAction) => void
  workspaceSlug: string
}) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      <h2 className="text-base font-extrabold tracking-[-0.025em]">
        Quick actions
      </h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <QuickActionButton
          icon={LogInIcon}
          label="Clock in"
          onClick={() => onActionChange("clock_in")}
          tone="green"
        />
        <QuickActionButton
          icon={LogOutIcon}
          label="Clock out"
          onClick={() => onActionChange("clock_out")}
          tone="blue"
        />
        <Link
          to="/w/$workspaceSlug/timesheets"
          params={{ workspaceSlug }}
          className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-2 text-xs font-extrabold text-violet-600 transition-colors active:bg-violet-100"
        >
          <FilePenLineIcon className="size-4" />
          Review
        </Link>
      </div>
    </section>
  )
}

function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  tone,
}: {
  icon: typeof LogInIcon
  label: string
  onClick: () => void
  tone: "blue" | "green"
}) {
  const className =
    tone === "green"
      ? "border-emerald-200 bg-emerald-50 text-[#00a84f] active:bg-emerald-100"
      : "border-blue-200 bg-blue-50 text-[#0069ff] active:bg-blue-100"

  return (
    <button
      type="button"
      className={cn(
        "flex h-11 items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-extrabold transition-colors",
        className
      )}
      onClick={onClick}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}

function MobileActivityList({
  entries,
  liveNow,
  selectedDate,
}: {
  entries: Array<ManagerClockActivityEntry>
  liveNow: Date
  selectedDate: string
}) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold tracking-[-0.025em]">
          {isToday(parseISO(selectedDate)) ? "Today's activity" : "Activity"}
        </h2>
        <span className="text-xs font-extrabold text-[#0069ff]">
          {entries.length} entries
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-[#dfe5f0] bg-[#f8faff] px-4 py-6 text-center text-sm font-semibold text-[#61709a]">
          No clock activity for this date yet.
        </p>
      ) : (
        <div className="mt-2 divide-y divide-[#edf0f6]">
          {entries.map((entry) => (
            <ActivityRow key={entry.id} entry={entry} liveNow={liveNow} />
          ))}
        </div>
      )}
    </section>
  )
}

function ActivityRow({
  entry,
  liveNow,
}: {
  entry: ManagerClockActivityEntry
  liveNow: Date
}) {
  const isOpen = !entry.clockedOutAt
  const isIssue =
    entry.status === "requires_review" || entry.isForgottenClockOutAlert

  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_4rem_5rem] items-center gap-3 py-3",
        isIssue && "rounded-xl bg-rose-50/70 px-2"
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold">{entry.employeeName}</p>
        <p className="mt-1 truncate text-xs font-semibold text-[#61709a]">
          {entry.zoneName ?? "Team"} - {entry.locationName}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-extrabold">
          {formatTime(entry.clockedInAt)}
        </p>
        <p className="text-[11px] font-semibold text-[#61709a]">In</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-extrabold">
          {entry.clockedOutAt ? formatTime(entry.clockedOutAt) : "-"}
        </p>
        <p className="text-[11px] font-semibold text-[#61709a]">
          {isOpen
            ? formatElapsedSummary(
                getElapsedMilliseconds(entry.clockedInAt, liveNow)
              )
            : "Out"}
        </p>
        <StatusPill entry={entry} />
      </div>
    </div>
  )
}

function StatusPill({ entry }: { entry: ManagerClockActivityEntry }) {
  if (entry.status === "requires_review" || entry.isForgottenClockOutAlert) {
    return (
      <span className="mt-1 inline-flex rounded-lg bg-rose-100 px-2 py-1 text-[11px] font-extrabold text-rose-600">
        Issue
      </span>
    )
  }

  if (!entry.clockedOutAt) {
    return (
      <span className="mt-1 inline-flex rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-extrabold text-[#00a84f]">
        Clocked in
      </span>
    )
  }

  return (
    <span className="mt-1 inline-flex rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-extrabold text-[#00a84f]">
      Complete
    </span>
  )
}

function MobileManualActions({
  action,
  employees,
  isApplyingOverride,
  onActionChange,
  onApplyOverride,
  onReasonChange,
  onSelectedEmployeeKeyChange,
  reason,
  selectedEmployee,
  selectedEmployeeKey,
}: {
  action: ClockAction
  employees: Array<ManagerClockEmployee>
  isApplyingOverride: boolean
  onActionChange: (action: ClockAction) => void
  onApplyOverride: () => void
  onReasonChange: (reason: string) => void
  onSelectedEmployeeKeyChange: (key: string) => void
  reason: string
  selectedEmployee: ManagerClockEmployee | null
  selectedEmployeeKey: string
}) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      <h2 className="text-base font-extrabold tracking-[-0.025em]">
        Manual actions
      </h2>
      <p className="mt-1 text-xs font-semibold text-[#61709a]">
        Select an employee and record a manager override.
      </p>

      <select
        className="mt-3 h-11 w-full rounded-xl border border-[#dfe5f0] bg-white px-3 text-sm font-bold text-[#11245a] outline-none"
        value={selectedEmployeeKey}
        onChange={(event) => onSelectedEmployeeKeyChange(event.target.value)}
      >
        {employees.map((employee) => (
          <option
            key={`${employee.locationId}:${employee.id}`}
            value={`${employee.locationId}:${employee.id}`}
          >
            {employee.name} - {employee.locationName}
          </option>
        ))}
      </select>

      <Textarea
        className="mt-3 min-h-20 rounded-xl border-[#dfe5f0] text-sm"
        value={reason}
        onChange={(event) => onReasonChange(event.target.value)}
        placeholder="Add a reason, e.g. forgot phone or manager correction."
      />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={action === "clock_in" ? "default" : "outline"}
          className={cn(
            "h-10 rounded-xl text-sm font-extrabold",
            action === "clock_in" && "bg-[#00a84f] hover:bg-[#009647]"
          )}
          onClick={() => onActionChange("clock_in")}
        >
          Clock in
        </Button>
        <Button
          type="button"
          variant={action === "clock_out" ? "default" : "outline"}
          className="h-10 rounded-xl text-sm font-extrabold"
          onClick={() => onActionChange("clock_out")}
        >
          Clock out
        </Button>
      </div>

      <Button
        className="mt-3 h-10 w-full rounded-xl text-sm font-extrabold"
        disabled={
          !selectedEmployee || reason.trim().length < 5 || isApplyingOverride
        }
        onClick={onApplyOverride}
      >
        {isApplyingOverride ? "Applying..." : "Apply override"}
      </Button>
    </section>
  )
}

function formatDateChip(value: string) {
  const date = parseISO(value)

  if (isToday(date)) {
    return `Today ${format(date, "d MMM")}`
  }

  return format(date, "EEE d MMM")
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export { MobileManagerTimeClockPage }
