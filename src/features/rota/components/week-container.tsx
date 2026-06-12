import Day from "./day"
import { DayContent } from "./day"
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
  const dayFrameClassName =
    mobileDayColumns === 2
      ? "h-full min-w-[calc(50%_-_0.25rem)] snap-start md:min-w-0"
      : "h-full min-w-full snap-center md:min-w-0"

  return (
    <div className={cn("min-h-0 min-w-0 flex-1 overflow-hidden", className)}>
      <div className="no-scrollbar flex h-full min-h-0 w-full snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain scroll-smooth rounded-lg border-2 border-dashed border-neutral-300 p-2 touch-pan-x md:grid md:grid-cols-7 md:overflow-hidden">
        {days.map((day) => (
          <div key={day.id} className={dayFrameClassName}>
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
