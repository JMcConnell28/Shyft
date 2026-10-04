import { addDays, format, isToday, parseISO } from "date-fns"
import { useNavigate } from "@tanstack/react-router"
import { RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DateStepControls } from "@/components/shared/date-step-controls"
import { useDebouncedDateSelection } from "@/hooks/use-debounced-date-selection"
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
  const navigate = useNavigate()
  const {
    selectedValue: date,
    isPending,
    updateSelection,
  } = useDebouncedDateSelection({
    value: selectedDate,
    scopeKey: workspaceSlug,
    onChange: (nextDate) =>
      navigate({
        to: "/app/$workspaceSlug/time-clock",
        params: { workspaceSlug },
        search: { date: nextDate },
        resetScroll: false,
      }),
  })
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
        <DateStepControls
          label={formatDateLabel(date)}
          unit="day"
          isPending={isPending}
          onStep={(direction) =>
            updateSelection((previous) =>
              format(addDays(parseISO(previous), direction), "yyyy-MM-dd")
            )
          }
        />
        <Button
          aria-label="Refresh clock activity"
          className="size-10 rounded-xl border-[#dfe4ef] bg-white text-[#10204b] shadow-none hover:bg-[#f9faff] sm:w-auto sm:px-3"
          disabled={isRefreshing || isPending}
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

function formatDateLabel(value: string) {
  const date = parseISO(value)

  return isToday(date)
    ? `Today, ${format(date, "d MMM")}`
    : format(date, "EEE, d MMM")
}

export { TimeClockHeader }
