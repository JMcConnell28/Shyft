import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"

function DayCosts({ readOnly = false }: { readOnly?: boolean }) {
  const { daySummaries, formatCurrency, formatMinutesAsHours } =
    useRotaWorkspace()

  return (
    <div className="grid h-full flex-1 grid-cols-7 rounded-lg border border-border/70 bg-card px-2 py-2 shadow-sm">
      {daySummaries.map((day) => (
        <div
          key={day.dayId}
          className="flex flex-col justify-center gap-0.5 border-r border-border/60 px-3 text-xs last:border-r-0"
        >
          <span className="text-sm font-semibold text-foreground">
            {formatMinutesAsHours(day.totalMinutes)}
          </span>
          {!readOnly ? (
            <span className="text-xs text-muted-foreground">
              {formatCurrency(day.totalCost)}
            </span>
          ) : null}
          <span className="text-xs text-muted-foreground">
            {day.totalShifts} shift{day.totalShifts === 1 ? "" : "s"}
          </span>
        </div>
      ))}
    </div>
  )
}

export default DayCosts
