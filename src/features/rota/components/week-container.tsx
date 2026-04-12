import Day from "./day"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"

function WeekContainer() {
  const { days } = useRotaWorkspace()

  return (
    <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
      <div className="grid h-full min-h-0 w-full grid-cols-7 gap-2 rounded-lg border-2 border-dashed border-neutral-300 p-2">
        {days.map((day) => (
          <Day key={day.id} dayId={day.id} />
        ))}
      </div>
    </div>
  )
}

export default WeekContainer
