import { LifeBuoyIcon, LogInIcon, LogOutIcon } from "lucide-react"

import type { ClockAction } from "@/features/time-clock/types"
import { Button } from "@/components/ui/button"
import {
  TimeClockPanel,
  TimeClockPanelHeader,
} from "@/features/time-clock/components/time-clock-panel"

function ManualClockActions({
  onAction,
}: {
  onAction: (action: ClockAction) => void
}) {
  return (
    <TimeClockPanel>
      <TimeClockPanelHeader
        icon={LifeBuoyIcon}
        subtitle="Help a team member when needed"
        title="Manual actions"
      />
      <div className="grid grid-cols-2 gap-3 p-4">
        <Button
          className="h-12 rounded-xl border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700 shadow-none hover:bg-emerald-100 hover:text-emerald-800"
          onClick={() => onAction("clock_in")}
          variant="outline"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-white">
            <LogInIcon className="size-4" />
          </span>
          Manual in
        </Button>
        <Button
          className="h-12 rounded-xl border-rose-200 bg-rose-50 text-sm font-semibold text-rose-700 shadow-none hover:bg-rose-100 hover:text-rose-800"
          onClick={() => onAction("clock_out")}
          variant="outline"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-white">
            <LogOutIcon className="size-4" />
          </span>
          Manual out
        </Button>
      </div>
    </TimeClockPanel>
  )
}

export { ManualClockActions }
