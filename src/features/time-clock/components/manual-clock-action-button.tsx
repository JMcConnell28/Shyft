import { LogInIcon, LogOutIcon } from "lucide-react"
import type { ClockAction } from "@/features/time-clock/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
      className={cn(
        "h-11 rounded-xl border-[#dfe4ef] bg-white text-sm font-semibold shadow-none",
        isSelected &&
          (action === "clock_in"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-rose-200 bg-rose-50 text-rose-700")
      )}
      onClick={onClick}
      type="button"
      variant="outline"
    >
      <Icon className="size-4" />
      Clock {action === "clock_in" ? "in" : "out"}
    </Button>
  )
}

export { ManualClockActionButton }
