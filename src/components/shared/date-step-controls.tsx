import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderCircleIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function DateStepControls({
  label,
  unit,
  isPending,
  onStep,
}: {
  label: string
  unit: "day" | "week"
  isPending: boolean
  onStep: (direction: -1 | 1) => void
}) {
  const Icon = isPending ? LoaderCircleIcon : CalendarDaysIcon
  return (
    <div className="grid min-w-0 flex-1 grid-cols-[2.5rem_minmax(8rem,1fr)_2.5rem] items-center overflow-hidden rounded-xl border border-[#dfe4ef] bg-white sm:flex-none">
      <StepButton direction="previous" unit={unit} onClick={() => onStep(-1)} />
      <div
        aria-busy={isPending}
        aria-live="polite"
        className="flex h-10 items-center justify-center gap-2 border-x border-[#e9edf5] px-2 text-xs font-semibold sm:min-w-40"
      >
        <Icon
          className={cn(
            "size-4 shrink-0 text-[#236cff]",
            isPending && "animate-spin"
          )}
          aria-hidden="true"
        />
        <span className="truncate">{label}</span>
        {isPending ? (
          <span className="sr-only">Loading selected {unit}</span>
        ) : null}
      </div>
      <StepButton direction="next" unit={unit} onClick={() => onStep(1)} />
    </div>
  )
}

function StepButton({
  direction,
  unit,
  onClick,
}: {
  direction: "next" | "previous"
  unit: "day" | "week"
  onClick: () => void
}) {
  const Icon = direction === "previous" ? ChevronLeftIcon : ChevronRightIcon
  return (
    <Button
      type="button"
      className="size-10 rounded-none border-0 bg-white text-[#46577d] shadow-none hover:bg-[#f6f8fc]"
      onClick={onClick}
      size="icon-lg"
      variant="ghost"
    >
      <Icon className="size-4" />
      <span className="sr-only">
        {direction === "previous" ? "Previous" : "Next"} {unit}
      </span>
    </Button>
  )
}

export { DateStepControls }
