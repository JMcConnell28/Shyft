import { LogInIcon, LogOutIcon } from "lucide-react"
import type { ClockAction } from "@/features/time-clock/types"
import { Button } from "@/components/ui/button"

function ManualClockActionButton({
  action,
  currentAction,
  onClick,
}: {
  action: ClockAction
  currentAction: ClockAction
  onClick: () => void
}) {
  const isSelected = action === currentAction
  const Icon = action === "clock_in" ? LogInIcon : LogOutIcon
  return (
    <Button
      aria-pressed={isSelected}
      onClick={onClick}
      type="button"
      variant="secondary"
    >
      <Icon className="size-4" />
      Clock {action === "clock_in" ? "in" : "out"}
    </Button>
  )
}

export { ManualClockActionButton }
