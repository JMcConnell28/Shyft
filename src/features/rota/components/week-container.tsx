import Day, { DayContent } from "./day"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { cn } from "@/lib/utils"

function WeekContainer({
  className,
  mobileDayColumns = 1,
  readOnly = false,
}: {
  className?: string
  mobileDayColumns?: 1 | 2
  readOnly?: boolean
}) {
  const { days } = useRotaWorkspace()
  const mobileColumnClassName =
    mobileDayColumns === 2
      ? "auto-cols-[calc(50%_-_0.3125rem)]"
      : "auto-cols-[100%]"

  return (
    <div className={cn("min-h-0 min-w-0 flex-1 overflow-hidden", className)}>
      <div
        className={cn(
          "no-scrollbar grid h-full min-h-0 w-full touch-pan-x snap-x snap-mandatory grid-flow-col gap-2.5 overflow-x-auto overscroll-x-contain scroll-smooth [-webkit-overflow-scrolling:touch] md:grid-flow-row md:auto-cols-auto md:grid-cols-7 md:gap-2 md:overflow-hidden",
          mobileColumnClassName
        )}
      >
        {days.map((day) => (
          <div
            key={day.id}
            className="h-full min-h-0 min-w-0 snap-start overflow-hidden"
          >
            {readOnly ? (
              <DayContent dayId={day.id} readOnly />
            ) : (
              <Day dayId={day.id} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default WeekContainer
