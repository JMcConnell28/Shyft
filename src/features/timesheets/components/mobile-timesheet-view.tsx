import { addDays, format, parseISO } from "date-fns"
import { Link } from "@tanstack/react-router"
import {
  BriefcaseBusinessIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Clock3Icon,
  InfoIcon,
} from "lucide-react"

import type {
  TimesheetDay,
  TimesheetEntry,
  TimesheetPageData,
  TimesheetScopeInput,
} from "@/features/timesheets/types"
import { Button } from "@/components/ui/button"
import { SageTimesheetExportButton } from "@/features/timesheets/components/sage-timesheet-export-button"
import {
  formatHours,
  formatTime,
} from "@/features/timesheets/utils/timesheet-time"
import { cn } from "@/lib/utils"

type MobileTimesheetViewProps = {
  data: TimesheetPageData
  input: TimesheetScopeInput
  workspaceSlug: string
}

function MobileTimesheetView({
  data,
  input,
  workspaceSlug,
}: MobileTimesheetViewProps) {
  const entryCount = data.employeeTimesheet.days.reduce(
    (total, day) => total + day.entries.length,
    0
  )
  const needsReview =
    data.employeeTimesheet.reviewCount > 0 ||
    data.employeeTimesheet.openEntryCount > 0

  return (
    <div className="flex flex-1 flex-col bg-[#f7f8fb] px-4 pt-2 pb-[max(2rem,env(safe-area-inset-bottom))] text-[#11245a] md:hidden">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <MobileTimesheetHeader />

        <MobileWeekControls
          weekLabel={data.weekLabel}
          weekStart={data.weekStart}
          workspaceSlug={workspaceSlug}
        />

        <MobileSummaryCard
          entryCount={entryCount}
          needsReview={needsReview}
          timesheet={data.employeeTimesheet}
        />

        <MobileWeeklyBreakdown
          days={data.employeeTimesheet.days}
          totalPayableMinutes={data.employeeTimesheet.payableMinutes}
        />

        {data.canManage && data.managerTimesheet ? (
          <MobileManagerExportCard data={data} input={input} />
        ) : null}

        <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#61709a] shadow-[0_6px_18px_rgba(30,50,96,0.05)] ring-1 ring-[#e7eaf2]">
          <span className="flex min-w-0 items-center gap-2">
            <InfoIcon className="size-4 shrink-0 text-[#0069ff]" />
            <span className="truncate">Payable hours include adjustments.</span>
          </span>
          <ChevronRightIcon className="size-4 shrink-0 text-[#61709a]" />
        </div>
      </div>
    </div>
  )
}

function MobileTimesheetHeader() {
  return (
    <section className="animate-in pt-1 duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
      <h1 className="text-[2rem] leading-none font-extrabold tracking-[-0.055em]">
        Your hours
      </h1>
      <p className="mt-2 text-sm font-semibold text-[#61709a]">
        Here&apos;s your timesheet for the selected week.
      </p>
    </section>
  )
}

function MobileWeekControls({
  weekLabel,
  weekStart,
  workspaceSlug,
}: {
  weekLabel: string
  weekStart: string
  workspaceSlug: string
}) {
  const current = parseISO(weekStart)
  const previousWeek = format(addDays(current, -7), "yyyy-MM-dd")
  const nextWeek = format(addDays(current, 7), "yyyy-MM-dd")

  return (
    <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-3 rounded-xl bg-white p-3 shadow-[0_6px_18px_rgba(30,50,96,0.055)] ring-1 ring-[#e7eaf2]">
      <WeekNavButton
        direction="previous"
        weekStart={previousWeek}
        workspaceSlug={workspaceSlug}
      />
      <div className="mx-auto inline-flex h-10 max-w-full items-center gap-2 rounded-xl border border-[#dfe5f0] bg-white px-4 text-sm font-extrabold text-[#11245a] shadow-[0_4px_12px_rgba(30,50,96,0.045)]">
        <CalendarDaysIcon className="size-4 text-[#0069ff]" />
        <span className="truncate">{weekLabel}</span>
      </div>
      <WeekNavButton
        direction="next"
        weekStart={nextWeek}
        workspaceSlug={workspaceSlug}
      />
    </div>
  )
}

function WeekNavButton({
  direction,
  weekStart,
  workspaceSlug,
}: {
  direction: "next" | "previous"
  weekStart: string
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
          to="/w/$workspaceSlug/timesheets"
          params={{ workspaceSlug }}
          search={{ weekStart }}
        />
      }
    >
      <Icon className="size-5" />
      <span className="sr-only">
        {direction === "previous" ? "Previous week" : "Next week"}
      </span>
    </Button>
  )
}

function MobileSummaryCard({
  entryCount,
  needsReview,
  timesheet,
}: {
  entryCount: number
  needsReview: boolean
  timesheet: TimesheetPageData["employeeTimesheet"]
}) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      <div className="grid grid-cols-3 divide-x divide-[#e4e8f0]">
        <SummaryMetric
          icon={Clock3Icon}
          label="Total hours"
          value={formatHours(timesheet.actualMinutes)}
        />
        <SummaryMetric
          icon={CalendarDaysIcon}
          label="Payable"
          value={formatHours(timesheet.payableMinutes)}
        />
        <SummaryMetric
          icon={BriefcaseBusinessIcon}
          label="Entries"
          value={String(entryCount)}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#edf0f6] pt-3 text-sm">
        <span
          className={cn(
            "inline-flex items-center gap-2 font-extrabold",
            needsReview ? "text-amber-700" : "text-[#00a84f]"
          )}
        >
          <CheckCircle2Icon className="size-4" />
          {needsReview ? "Needs review" : "Ready"}
        </span>
        <span className="min-w-0 truncate font-semibold text-[#61709a]">
          {needsReview
            ? "Some entries need manager attention."
            : "Timesheet looks complete for the week."}
        </span>
        <ChevronRightIcon className="size-4 shrink-0 text-[#61709a]" />
      </div>
    </section>
  )
}

function SummaryMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3Icon
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 px-2 first:pl-0 last:pr-0">
      <span className="flex size-8 items-center justify-center rounded-xl bg-[#e1f8eb] text-[#00a84f]">
        <Icon className="size-4" />
      </span>
      <p className="mt-2 truncate text-xs font-semibold text-[#61709a]">
        {label}
      </p>
      <p className="mt-1 truncate text-[1.65rem] leading-none font-extrabold tracking-[-0.055em] text-[#11245a]">
        {value}
      </p>
    </div>
  )
}

function MobileWeeklyBreakdown({
  days,
  totalPayableMinutes,
}: {
  days: Array<TimesheetDay>
  totalPayableMinutes: number
}) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0069ff]">
          <CalendarDaysIcon className="size-5" />
        </span>
        <h2 className="text-lg font-extrabold tracking-[-0.035em]">
          Weekly breakdown
        </h2>
      </div>

      <div className="mt-4 divide-y divide-[#edf0f6]">
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

      <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-[#00a84f]">
        <span className="inline-flex items-center gap-2 text-sm font-extrabold">
          <CalendarDaysIcon className="size-4" />
          Weekly total
        </span>
        <span className="text-lg font-extrabold tracking-[-0.035em]">
          {formatHours(totalPayableMinutes)}
        </span>
      </div>
    </section>
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
    <div className="grid grid-cols-[3.25rem_minmax(0,1fr)_4.75rem] items-center gap-3 py-2.5">
      <DayBadge day={day} />
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "size-2 shrink-0 rounded-full",
              getEntryDotClassName(entry)
            )}
          />
          <span className="truncate text-sm font-extrabold text-[#11245a]">
            {getEntryTimeLabel(entry)}
          </span>
        </div>
        <div className="mt-1 flex min-w-0 items-center gap-2">
          <span className="truncate text-xs font-semibold text-[#61709a]">
            {entry?.locationName ?? "-"}
          </span>
          {entry?.zoneName ? (
            <span className="shrink-0 rounded-md bg-[#eef3ff] px-1.5 py-0.5 text-[10px] font-bold text-[#0069ff]">
              {entry.zoneName}
            </span>
          ) : null}
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-extrabold text-[#11245a]">
          {formatHours(entry?.payableMinutes ?? 0)}
        </p>
        <p className="text-xs font-semibold text-[#61709a]">payable</p>
      </div>
    </div>
  )
}

function DayBadge({ day }: { day: TimesheetDay }) {
  const date = parseISO(day.date)

  return (
    <div className="flex h-12 flex-col items-center justify-center rounded-lg border border-[#dfe5f0] bg-white text-[#11245a]">
      <span className="text-[10px] font-extrabold tracking-[0.08em] text-[#61709a] uppercase">
        {day.dayLabel}
      </span>
      <span className="text-lg leading-none font-extrabold">
        {format(date, "d")}
      </span>
    </div>
  )
}

function MobileManagerExportCard({
  data,
  input,
}: {
  data: TimesheetPageData
  input: TimesheetScopeInput
}) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-[0_6px_18px_rgba(30,50,96,0.05)] ring-1 ring-[#e7eaf2]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-[#11245a]">Team week</h2>
          <p className="mt-0.5 text-xs font-semibold text-[#61709a]">
            {data.managerTimesheet?.employees.length ?? 0} employees
          </p>
        </div>
        <SageTimesheetExportButton
          input={input}
          rotas={data.exportableRotas}
          size="sm"
          className="h-9 rounded-xl text-xs font-extrabold"
          disabledReason={
            data.exportableRotas.length === 0
              ? "No published rota is available for this week."
              : null
          }
        />
      </div>
    </section>
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

export { MobileTimesheetView }
