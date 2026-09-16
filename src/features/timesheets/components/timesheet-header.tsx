import { addDays, format, parseISO } from "date-fns"
import { Link } from "@tanstack/react-router"
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserRoundIcon,
  UsersRoundIcon,
} from "lucide-react"

import type {
  TimesheetPageData,
  TimesheetScopeInput,
  TimesheetViewMode,
} from "@/features/timesheets/types"
import { Button } from "@/components/ui/button"
import { SageTimesheetExportButton } from "@/features/timesheets/components/sage-timesheet-export-button"
import { cn } from "@/lib/utils"

type TimesheetHeaderProps = {
  activeView: TimesheetViewMode
  canViewTeam: boolean
  data: TimesheetPageData
  input: TimesheetScopeInput
  onViewChange: (view: TimesheetViewMode) => void
  workspaceSlug: string
}

function TimesheetHeader({
  activeView,
  canViewTeam,
  data,
  input,
  onViewChange,
  workspaceSlug,
}: TimesheetHeaderProps) {
  const isTeamView = activeView === "team"

  return (
    <header className="flex animate-in flex-col gap-4 duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl leading-none font-bold tracking-[-0.035em] sm:text-[1.75rem]">
            {isTeamView ? "Timesheets" : "My timesheet"}
          </h1>
          <p className="mt-2 text-sm font-medium text-[#68769a]">
            {isTeamView
              ? "Review your team’s hours and resolve records before payroll."
              : "Review your worked, scheduled, and payable hours."}
          </p>
        </div>

        <div className="flex w-full min-w-0 items-center gap-2 lg:w-auto">
          <WeekControls
            weekLabel={data.weekLabel}
            weekStart={data.weekStart}
            workspaceSlug={workspaceSlug}
          />
          {isTeamView ? (
            <SageTimesheetExportButton
              className="h-10 rounded-xl border-[#dfe4ef] bg-white px-3 font-semibold shadow-none"
              disabledReason={
                data.exportableRotas.length === 0
                  ? "No published rota is available for this week."
                  : null
              }
              input={input}
              label="Export"
              rotas={data.exportableRotas}
              size="lg"
            />
          ) : null}
        </div>
      </div>

      {canViewTeam ? (
        <div
          aria-label="Timesheet view"
          className="grid w-full grid-cols-2 rounded-xl bg-[#e9edf5] p-1 sm:w-fit"
          role="group"
        >
          <ViewButton
            activeView={activeView}
            icon={UserRoundIcon}
            label="My timesheet"
            onViewChange={onViewChange}
            view="mine"
          />
          <ViewButton
            activeView={activeView}
            icon={UsersRoundIcon}
            label="Team timesheets"
            onViewChange={onViewChange}
            view="team"
          />
        </div>
      ) : null}
    </header>
  )
}

function ViewButton({
  activeView,
  icon: Icon,
  label,
  onViewChange,
  view,
}: {
  activeView: TimesheetViewMode
  icon: typeof UserRoundIcon
  label: string
  onViewChange: (view: TimesheetViewMode) => void
  view: TimesheetViewMode
}) {
  const isActive = activeView === view

  return (
    <Button
      aria-pressed={isActive}
      className={cn(
        "h-9 rounded-lg border-0 px-3 font-semibold shadow-none",
        isActive
          ? "bg-white text-[#10204b] shadow-[0_2px_8px_rgba(26,43,83,0.08)]"
          : "bg-transparent text-[#68769a] hover:bg-white/60"
      )}
      onClick={() => onViewChange(view)}
      variant="ghost"
    >
      <Icon className="size-4" />
      {label}
    </Button>
  )
}

function WeekControls({
  weekLabel,
  weekStart,
  workspaceSlug,
}: {
  weekLabel: string
  weekStart: string
  workspaceSlug: string
}) {
  const current = parseISO(weekStart)

  return (
    <div className="grid min-w-0 flex-1 grid-cols-[2.5rem_minmax(8rem,1fr)_2.5rem] items-center overflow-hidden rounded-xl border border-[#dfe4ef] bg-white sm:flex-none">
      <WeekLink
        direction="previous"
        weekStart={format(addDays(current, -7), "yyyy-MM-dd")}
        workspaceSlug={workspaceSlug}
      />
      <div className="flex h-10 items-center justify-center gap-2 border-x border-[#e9edf5] px-2 text-xs font-semibold sm:min-w-40">
        <CalendarDaysIcon className="size-4 text-[#236cff]" />
        <span className="truncate">{weekLabel}</span>
      </div>
      <WeekLink
        direction="next"
        weekStart={format(addDays(current, 7), "yyyy-MM-dd")}
        workspaceSlug={workspaceSlug}
      />
    </div>
  )
}

function WeekLink({
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
      className="size-10 rounded-none border-0 bg-white text-[#46577d] shadow-none hover:bg-[#f6f8fc]"
      nativeButton={false}
      render={
        <Link
          params={{ workspaceSlug }}
          search={{ weekStart }}
          to="/w/$workspaceSlug/timesheets"
        />
      }
      size="icon-lg"
      variant="ghost"
    >
      <Icon className="size-4" />
      <span className="sr-only">
        {direction === "previous" ? "Previous week" : "Next week"}
      </span>
    </Button>
  )
}

export { TimesheetHeader }
