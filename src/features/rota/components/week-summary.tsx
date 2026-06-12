import DayCosts from "./day-costs"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"

function WeekSummary({ readOnly = false }: { readOnly?: boolean }) {
  const {
    formatCurrency,
    formatMinutesAsHours,
    totalScheduledCost,
    totalScheduledMinutes,
  } = useRotaWorkspace()

  return (
    <div className="flex h-20 w-full shrink-0 gap-2">
      <div className="flex w-64 shrink-0 flex-col justify-center rounded-lg border border-border/70 bg-card px-4 py-3 shadow-sm">
        <span className="text-sm font-semibold text-foreground">
          Week summary
        </span>
        <span className="mt-1 text-sm text-foreground">
          {formatMinutesAsHours(totalScheduledMinutes)} scheduled
        </span>
        {!readOnly ? (
          <span className="text-xs text-muted-foreground">
            {formatCurrency(totalScheduledCost)} labour cost
          </span>
        ) : null}
        {readOnly ? (
          <span className="text-[10px] text-muted-foreground">
            Published team view
          </span>
        ) : null}
      </div>
      <DayCosts readOnly={readOnly} />
    </div>
  )
}

export default WeekSummary
