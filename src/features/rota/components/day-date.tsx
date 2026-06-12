import type { WorkspaceDay } from "@/features/rota/types/workspace"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function DayDate({
  day,
  openShiftCount,
  showOpenShiftCount = true,
}: {
  day: WorkspaceDay
  openShiftCount: number
  showOpenShiftCount?: boolean
}) {
  return (
    <div className="relative px-2 py-2 text-center">
      {showOpenShiftCount && openShiftCount > 0 ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label={`${openShiftCount} open shifts`}
                className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-background"
              />
            }
          />
          <TooltipContent>There are shifts with no employees.</TooltipContent>
        </Tooltip>
      ) : null}
      <div className="flex items-center justify-center">
        <span className="text-sm font-medium tracking-[0.16em] text-muted-foreground uppercase">
          {day.shortLabel}
        </span>
        <div className="ml-2">
          <span className="text-xs">{day.dayNumber} </span>
          <span className="text-xs text-muted-foreground">{day.monthLabel}</span>
        </div>
      </div>
    </div>
  )
}

export default DayDate
