import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"

function DayCosts() {
  const { daySummaries, formatMinutesAsHours } = useRotaWorkspace()

  return (
    <div className="grid h-full flex-1 grid-cols-7 gap-2 rounded-lg border bg-card px-2 py-1">
      {daySummaries.map((day) => (
        <div key={day.dayId} className="flex flex-col justify-center text-xs">
          <span className="font-medium text-foreground">
            {formatMinutesAsHours(day.totalMinutes)}
          </span>
          <span className="text-muted-foreground">
            {day.totalShifts} shift{day.totalShifts === 1 ? "" : "s"}
          </span>
        </div>
      ))}
    </div>
  )
}

export default DayCosts
