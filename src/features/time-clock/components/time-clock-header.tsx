import { addDays, format, isToday, parseISO } from "date-fns"
import { Link } from "@tanstack/react-router"
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RefreshCwIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type TimeClockHeaderProps = {
  isRefreshing: boolean
  onRefresh: () => void
  selectedDate: string
  workspaceSlug: string
}

function TimeClockHeader({
  isRefreshing,
  onRefresh,
  selectedDate,
  workspaceSlug,
}: TimeClockHeaderProps) {
  return (
    <header className="flex animate-in flex-col gap-4 duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl leading-none font-bold tracking-[-0.035em] sm:text-[1.75rem]">
          Time tracking
        </h1>
        <p className="mt-2 text-sm font-medium text-[#68769a]">
          Manage staff clock-ins, clock-outs, and attendance issues.
        </p>
      </div>

      <div className="flex w-full min-w-0 items-center gap-2 md:w-auto">
        <div className="mr-1 hidden items-center gap-2 text-xs font-medium text-[#68769a] lg:flex">
          <span className="size-2 rounded-full bg-emerald-500" />
          Auto-refreshing
        </div>
        <DateControls
          selectedDate={selectedDate}
          workspaceSlug={workspaceSlug}
        />
        <Button
          aria-label="Refresh clock activity"
          className="size-10 rounded-xl border-[#dfe4ef] bg-white text-[#10204b] shadow-none hover:bg-[#f9faff] sm:w-auto sm:px-3"
          disabled={isRefreshing}
          onClick={onRefresh}
          size="icon-lg"
          variant="outline"
        >
          <RefreshCwIcon
            className={cn("size-4", isRefreshing && "animate-spin")}
          />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
    </header>
  )
}

function DateControls({
  selectedDate,
  workspaceSlug,
}: {
  selectedDate: string
  workspaceSlug: string
}) {
  const date = parseISO(selectedDate)

  return (
    <div className="grid min-w-0 flex-1 grid-cols-[2.5rem_minmax(7.5rem,1fr)_2.5rem] items-center overflow-hidden rounded-xl border border-[#dfe4ef] bg-white sm:flex-none">
      <DateLink
        date={format(addDays(date, -1), "yyyy-MM-dd")}
        direction="previous"
        workspaceSlug={workspaceSlug}
      />
      <div className="flex h-10 items-center justify-center gap-2 border-x border-[#e9edf5] px-2 text-xs font-semibold sm:min-w-36">
        <CalendarDaysIcon className="size-4 text-[#236cff]" />
        <span className="truncate">{formatDateLabel(selectedDate)}</span>
      </div>
      <DateLink
        date={format(addDays(date, 1), "yyyy-MM-dd")}
        direction="next"
        workspaceSlug={workspaceSlug}
      />
    </div>
  )
}

function DateLink({
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
      className="size-10 rounded-none border-0 bg-white text-[#46577d] shadow-none hover:bg-[#f6f8fc]"
      nativeButton={false}
      render={
        <Link
          params={{ workspaceSlug }}
          search={{ date }}
          to="/app/$workspaceSlug/time-clock"
        />
      }
      size="icon-lg"
      variant="ghost"
    >
      <Icon className="size-4" />
      <span className="sr-only">
        {direction === "previous" ? "Previous day" : "Next day"}
      </span>
    </Button>
  )
}

function formatDateLabel(value: string) {
  const date = parseISO(value)

  return isToday(date)
    ? `Today, ${format(date, "d MMM")}`
    : format(date, "EEE, d MMM")
}

export { TimeClockHeader }
