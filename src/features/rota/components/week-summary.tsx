import DayCosts from "./day-costs"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"

function WeekSummary() {
  const { formatMinutesAsHours, totalScheduledMinutes } = useRotaWorkspace()

  return (
    <div className="flex h-14 w-full shrink-0 gap-2">
      <div className="flex w-64 shrink-0 flex-col justify-center rounded-lg border bg-card px-3 text-sm">
        <span className="font-medium text-foreground">Week summary</span>
        <span className="text-xs text-muted-foreground">
          {formatMinutesAsHours(totalScheduledMinutes)} scheduled
        </span>
      </div>
      <DayCosts />
    </div>
  )
}

export default WeekSummary
