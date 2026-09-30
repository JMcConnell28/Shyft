import type { WorkspaceDay } from "@/features/rota/types/workspace"
import { DayDateLabel } from "@/features/rota/components/day-date-label"
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
      <DayDateLabel day={day} />
    </div>
  )
}

export default DayDate
