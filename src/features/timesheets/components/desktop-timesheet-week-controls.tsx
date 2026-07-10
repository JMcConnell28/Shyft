import { addDays, format, parseISO } from "date-fns"
import { Link } from "@tanstack/react-router"
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"

function DesktopTimesheetWeekControls({
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
    <div className="grid grid-cols-[2.25rem_minmax(11rem,1fr)_2.25rem] items-center gap-2 rounded-[12px] border border-[#dfe5f0] bg-[#fbfcff] p-1.5">
      <WeekNavButton
        direction="previous"
        weekStart={previousWeek}
        workspaceSlug={workspaceSlug}
      />
      <div className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-[#edf0f6] bg-white px-3 text-sm font-semibold text-[#11245a] shadow-[0_4px_12px_rgba(30,50,96,0.035)]">
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
      className="size-9 rounded-[10px] bg-white text-[#11245a] shadow-[0_4px_12px_rgba(30,50,96,0.035)] ring-1 ring-[#dfe5f0] hover:bg-[#fbfcff]"
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

export { DesktopTimesheetWeekControls }
