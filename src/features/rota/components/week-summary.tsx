import * as React from "react"
import { PencilIcon, TriangleAlertIcon } from "lucide-react"

import DayCosts from "./day-costs"
import { Button } from "@/components/ui/button"
import { BudgetManagerDialog } from "@/features/rota/components/budget-manager-dialog"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"

function WeekSummary({ readOnly = false }: { readOnly?: boolean }) {
  const [budgetOpen, setBudgetOpen] = React.useState(false)
  const {
    formatCurrency,
    formatMinutesAsHours,
    totalScheduledCost,
    totalScheduledMinutes,
    budgetInsights,
    meta,
  } = useRotaWorkspace()
  const budget = meta.budgetPence === null ? null : meta.budgetPence / 100
  const budgetVariance = budget === null ? null : budget - totalScheduledCost
  const isOverBudget = budgetVariance !== null && budgetVariance < 0
  const suggestionCount = budgetInsights.suggestions.length

  return (
    <div className="flex h-20 w-full shrink-0 gap-2">
      <div
        className={`flex w-64 shrink-0 flex-col justify-center rounded-lg border px-4 py-3 shadow-sm ${
          isOverBudget
            ? "border-destructive/40 bg-destructive/5"
            : "border-border/70 bg-card"
        }`}
      >
        <span className="text-sm font-semibold text-foreground">
          Week summary
        </span>
        <span className="mt-1 text-sm text-foreground">
          {formatMinutesAsHours(totalScheduledMinutes)} scheduled
        </span>
        {!readOnly ? (
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <span
              className={
                isOverBudget
                  ? "flex items-center gap-1 text-xs font-medium text-destructive"
                  : "text-xs text-muted-foreground"
              }
            >
              {isOverBudget ? <TriangleAlertIcon className="size-3" /> : null}
              {budgetVariance === null
                ? `${formatCurrency(totalScheduledCost)} labour cost`
                : isOverBudget
                  ? `${formatCurrency(Math.abs(budgetVariance))} over budget`
                  : `${formatCurrency(budgetVariance)} remaining`}
              {suggestionCount > 0 ? ` | ${suggestionCount} ideas` : ""}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={
                budget === null ? "Set weekly budget" : "Edit weekly budget"
              }
              onClick={() => setBudgetOpen(true)}
            >
              <PencilIcon />
            </Button>
          </div>
        ) : null}
        {readOnly ? (
          <span className="text-[10px] text-muted-foreground">
            Published team view
          </span>
        ) : null}
      </div>
      <DayCosts readOnly={readOnly} />
      {!readOnly ? (
        <BudgetManagerDialog open={budgetOpen} onOpenChange={setBudgetOpen} />
      ) : null}
    </div>
  )
}

export default WeekSummary
