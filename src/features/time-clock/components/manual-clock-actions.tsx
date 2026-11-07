import { LifeBuoyIcon, LogInIcon, LogOutIcon } from "lucide-react"

import type { ClockAction } from "@/features/time-clock/types"
import { Button } from "@/components/ui/button"
import {
  TimeClockPanel,
  TimeClockPanelHeader,
} from "@/features/time-clock/components/time-clock-panel"

function ManualClockActions({
  disabled,
  onAction,
}: {
  disabled: boolean
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
          disabled={disabled}
          onClick={() => onAction("clock_in")}
          variant="secondary"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-white">
            <LogInIcon className="size-4" />
          </span>
          Manual in
        </Button>
        <Button
          disabled={disabled}
          onClick={() => onAction("clock_out")}
          variant="secondary"
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
