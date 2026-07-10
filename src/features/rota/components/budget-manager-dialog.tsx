"use client"

import * as React from "react"
import { AlertTriangleIcon, LightbulbIcon, ShieldCheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { useUpdateRotaBudget } from "@/features/rota/hooks/use-update-rota-budget"
import type {
  BudgetBreakdownRow,
  BudgetGuardrail,
  BudgetSuggestion,
} from "@/features/rota/utils/budget-insights"
import { poundsToPence } from "@/features/staff-groups/utils/compensation"

function BudgetManagerDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const {
    budgetInsights,
    formatCurrency,
    formatMinutesAsHours,
    meta,
    totalScheduledCost,
    totalScheduledMinutes,
  } = useRotaWorkspace()
  const { isSaving, saveBudget } = useUpdateRotaBudget()
  const [amount, setAmount] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setAmount(
      meta.budgetPence === null ? "" : (meta.budgetPence / 100).toFixed(2)
    )
    setError(null)
  }, [meta.budgetPence, open])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const budgetPence = poundsToPence(amount)

    if (budgetPence === null) {
      setError("Enter a valid weekly budget.")
      return
    }

    await saveBudget(budgetPence)
    onOpenChange(false)
  }

  async function handleRemove() {
    await saveBudget(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto p-0 sm:max-w-3xl">
        <form onSubmit={(event) => void handleSubmit(event)}>
          <DialogHeader className="p-5 pb-4">
            <DialogTitle>Budget manager</DialogTitle>
            <DialogDescription>
              Control scheduled labour cost for {meta.weekLabel.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 px-5 pb-5">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_2fr]">
              <div className="grid gap-2">
                <Label htmlFor="weekly-budget">Weekly budget</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                    GBP
                  </span>
                  <Input
                    id="weekly-budget"
                    className="pl-10"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={amount}
                    disabled={isSaving}
                    onChange={(event) => {
                      setAmount(event.target.value)
                      setError(null)
                    }}
                  />
                </div>
                {error ? (
                  <p className="text-xs text-destructive">{error}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <BudgetStat
                  label="Scheduled"
                  value={formatCurrency(totalScheduledCost)}
                />
                <BudgetStat
                  label="Hours"
                  value={formatMinutesAsHours(totalScheduledMinutes)}
                />
                <BudgetStat
                  tone={budgetInsights.isOverBudget ? "danger" : "normal"}
                  label={budgetInsights.isOverBudget ? "Over" : "Remaining"}
                  value={
                    budgetInsights.weeklyBudget === null
                      ? "-"
                      : budgetInsights.isOverBudget
                        ? formatCurrency(budgetInsights.overBudgetAmount)
                        : formatCurrency(
                            budgetInsights.weeklyBudget - totalScheduledCost
                          )
                  }
                />
              </div>
            </div>

            <BudgetActionList
              title="Savings suggestions"
              icon={<LightbulbIcon className="size-4" />}
              emptyMessage="No obvious savings suggestions yet."
              items={budgetInsights.suggestions}
              renderItem={(item) => (
                <SuggestionRow
                  item={item}
                  formatCurrency={formatCurrency}
                />
              )}
            />

            <BudgetActionList
              title="Coverage guardrails"
              icon={<ShieldCheckIcon className="size-4" />}
              emptyMessage="No coverage warnings."
              items={budgetInsights.guardrails}
              renderItem={(item) => <GuardrailRow item={item} />}
            />

            <div className="grid gap-3 md:grid-cols-2">
              <BreakdownList
                title="Day targets"
                rows={budgetInsights.dayBreakdown}
                formatCurrency={formatCurrency}
              />
              <BreakdownList
                title="Zone targets"
                rows={budgetInsights.zoneBreakdown}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <div>
              {meta.budgetPence !== null ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSaving}
                  onClick={() => void handleRemove()}
                >
                  Remove budget
                </Button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save budget"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function BudgetStat({
  label,
  tone = "normal",
  value,
}: {
  label: string
  tone?: "danger" | "normal"
  value: string
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        tone === "danger"
          ? "border-destructive/30 bg-destructive/5"
          : "border-border/70 bg-muted/20"
      }`}
    >
      <p className="text-[11px] font-medium text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}

function BudgetActionList<TItem extends { id: string }>({
  emptyMessage,
  icon,
  items,
  renderItem,
  title,
}: {
  emptyMessage: string
  icon: React.ReactNode
  items: TItem[]
  renderItem: (item: TItem) => React.ReactNode
  title: string
}) {
  return (
    <section className="rounded-lg border border-border/70 p-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </h3>
      <div className="mt-3 grid gap-2">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">{emptyMessage}</p>
        ) : (
          items.map((item) => (
            <React.Fragment key={item.id}>{renderItem(item)}</React.Fragment>
          ))
        )}
      </div>
    </section>
  )
}

function SuggestionRow({
  formatCurrency,
  item,
}: {
  formatCurrency: (value: number) => string
  item: BudgetSuggestion
}) {
  return (
    <div className="rounded-md bg-muted/20 px-3 py-2">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">{item.title}</p>
        {item.estimatedSaving !== null ? (
          <span className="shrink-0 text-xs font-semibold text-emerald-700">
            {formatCurrency(item.estimatedSaving)}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
    </div>
  )
}

function GuardrailRow({ item }: { item: BudgetGuardrail }) {
  return (
    <div className="rounded-md bg-amber-50 px-3 py-2 text-amber-900">
      <p className="flex items-center gap-2 text-sm font-medium">
        <AlertTriangleIcon className="size-3.5" />
        {item.title}
      </p>
      <p className="mt-1 text-xs text-amber-800">{item.detail}</p>
    </div>
  )
}

function BreakdownList({
  formatCurrency,
  rows,
  title,
}: {
  formatCurrency: (value: number) => string
  rows: BudgetBreakdownRow[]
  title: string
}) {
  return (
    <section className="rounded-lg border border-border/70 p-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 grid gap-1.5">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_auto] gap-3 text-xs">
            <div className="min-w-0">
              <p className="truncate font-medium">{row.label}</p>
              <p className="text-muted-foreground">
                {row.totalShifts} shift{row.totalShifts === 1 ? "" : "s"}
              </p>
            </div>
            <div className="text-right">
              <p
                className={
                  row.variance !== null && row.variance < 0
                    ? "font-semibold text-destructive"
                    : "font-semibold"
                }
              >
                {formatCurrency(row.totalCost)}
              </p>
              <p className="text-muted-foreground">
                {row.targetCost === null
                  ? "No target"
                  : `${formatCurrency(row.targetCost)} target`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export { BudgetManagerDialog }
