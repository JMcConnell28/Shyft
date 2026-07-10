import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"

function DayCosts({ readOnly = false }: { readOnly?: boolean }) {
  const {
    budgetInsights,
    daySummaries,
    formatCurrency,
    formatMinutesAsHours,
    selectedZoneId,
  } =
    useRotaWorkspace()
  const dayBudgetById = Object.fromEntries(
    budgetInsights.dayBreakdown.map((day) => [day.id, day])
  )

  return (
    <div className="grid h-full flex-1 grid-cols-7 rounded-lg border border-border/70 bg-card px-2 py-2 shadow-sm">
      {daySummaries.map((day) => {
        const budgetDay = dayBudgetById[day.dayId]
        const showBudgetState = selectedZoneId === "all" && !readOnly
        const isOverBudget =
          showBudgetState &&
          budgetDay?.variance !== null &&
          budgetDay?.variance !== undefined &&
          budgetDay.variance < 0

        return (
          <div
            key={day.dayId}
            className={`flex flex-col justify-center gap-0.5 border-r px-3 text-xs last:border-r-0 ${
              isOverBudget
                ? "border-destructive/20 bg-destructive/5"
                : "border-border/60"
            }`}
          >
            <span className="text-sm font-semibold text-foreground">
              {formatMinutesAsHours(day.totalMinutes)}
            </span>
            {!readOnly ? (
              <span
                className={
                  isOverBudget
                    ? "text-xs font-medium text-destructive"
                    : "text-xs text-muted-foreground"
                }
              >
                {formatCurrency(day.totalCost)}
              </span>
            ) : null}
            <span className="text-xs text-muted-foreground">
              {day.totalShifts} shift{day.totalShifts === 1 ? "" : "s"}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default DayCosts
