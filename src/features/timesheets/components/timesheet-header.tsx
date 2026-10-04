import { addDays, format, parseISO } from "date-fns"
import { useNavigate } from "@tanstack/react-router"
import { UserRoundIcon, UsersRoundIcon } from "lucide-react"

import type {
  TimesheetPageData,
  TimesheetScopeInput,
  TimesheetViewMode,
} from "@/features/timesheets/types"
import { Button } from "@/components/ui/button"
import { SageTimesheetExportButton } from "@/features/timesheets/components/sage-timesheet-export-button"
import {
  getTimesheetWeek,
  isTimesheetWeekComplete,
} from "@/features/timesheets/utils/timesheet-time"
import { DateStepControls } from "@/components/shared/date-step-controls"
import { useDebouncedDateSelection } from "@/hooks/use-debounced-date-selection"
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
  const navigate = useNavigate()
  const {
    selectedValue: selectedWeek,
    isPending,
    updateSelection,
  } = useDebouncedDateSelection({
    value: data.weekStart,
    scopeKey: workspaceSlug,
    onChange: (weekStart) =>
      navigate({
        to: "/app/$workspaceSlug/timesheets",
        params: { workspaceSlug },
        search: { weekStart },
        resetScroll: false,
      }),
  })

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
          <DateStepControls
            label={getTimesheetWeek(selectedWeek).weekLabel}
            unit="week"
            isPending={isPending}
            onStep={(direction) =>
              updateSelection((previous) =>
                format(addDays(parseISO(previous), direction * 7), "yyyy-MM-dd")
              )
            }
          />
          {isTeamView ? (
            <SageTimesheetExportButton
              className="h-10 rounded-xl border-[#dfe4ef] bg-white px-3 font-semibold shadow-none"
              disabledReason={
                isPending
                  ? "Wait for the selected week to load before exporting."
                  : !isTimesheetWeekComplete(data.weekStart)
                    ? "Sage exports are only available for completed timesheet weeks."
                    : null
              }
              input={{ ...input, weekStart: data.weekStart }}
              label="Export"
              locations={data.locations}
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

export { TimesheetHeader }
