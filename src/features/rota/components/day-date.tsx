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
    <div className="relative bg-card px-3 py-2.5">
      {showOpenShiftCount && openShiftCount > 0 ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label={`${openShiftCount} open shifts`}
                className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white"
              />
            }
          />
          <TooltipContent>There are shifts with no employees.</TooltipContent>
        </Tooltip>
      ) : null}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-extrabold tracking-[0.14em] text-[#61709a] uppercase">
          {day.shortLabel}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-base leading-none font-extrabold tracking-[-0.04em] text-[#11245a]">
            {day.dayNumber}
          </span>
          <span className="text-xs font-semibold text-[#61709a]">
            {day.monthLabel}
          </span>
        </div>
      </div>
    </div>
  )
}

export default DayDate
