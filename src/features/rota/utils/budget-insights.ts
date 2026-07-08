import type { WorkspaceDay } from "@/features/rota/types/workspace"
import type {
  ScheduledDayCostSummary,
  ScheduledShiftCostSummary,
  ScheduledZoneCostSummary,
} from "@/features/rota/utils/workspace-budget"

type BudgetBreakdownRow = {
  id: string
  label: string
  targetCost: number | null
  totalCost: number
  totalMinutes: number
  totalShifts: number
  variance: number | null
}

type BudgetSuggestion = {
  detail: string
  estimatedSaving: number | null
  id: string
  title: string
}

type BudgetGuardrail = {
  detail: string
  id: string
  title: string
}

type BudgetInsights = {
  dayBreakdown: BudgetBreakdownRow[]
  guardrails: BudgetGuardrail[]
  isOverBudget: boolean
  overBudgetAmount: number
  suggestions: BudgetSuggestion[]
  totalCost: number
  totalMinutes: number
  weeklyBudget: number | null
  zoneBreakdown: BudgetBreakdownRow[]
}

function buildBudgetInsights(input: {
  budgetPence: number | null
  days: WorkspaceDay[]
  daySummaries: ScheduledDayCostSummary[]
  shiftSummaries: ScheduledShiftCostSummary[]
  zoneSummaries: ScheduledZoneCostSummary[]
}): BudgetInsights {
  const weeklyBudget = input.budgetPence === null ? null : input.budgetPence / 100
  const totalCost = sum(input.daySummaries.map((summary) => summary.totalCost))
  const totalMinutes = sum(
    input.daySummaries.map((summary) => summary.totalMinutes)
  )
  const dayLabelById = Object.fromEntries(
    input.days.map((day) => [day.id, day.shortLabel])
  )
  const dayBreakdown = input.daySummaries.map((summary) =>
    toBreakdownRow({
      id: summary.dayId,
      label: dayLabelById[summary.dayId] ?? "Day",
      summary,
      totalMinutes,
      weeklyBudget,
    })
  )
  const zoneBreakdown = input.zoneSummaries
    .map((summary) =>
      toBreakdownRow({
        id: summary.zoneId,
        label: summary.zoneName,
        summary,
        totalMinutes,
        weeklyBudget,
      })
    )
    .sort((left, right) => right.totalCost - left.totalCost)
  const overBudgetAmount =
    weeklyBudget === null ? 0 : Math.max(totalCost - weeklyBudget, 0)

  return {
    dayBreakdown,
    guardrails: buildGuardrails(input.shiftSummaries, dayLabelById),
    isOverBudget: overBudgetAmount > 0,
    overBudgetAmount,
    suggestions: buildSuggestions({
      dayBreakdown,
      overBudgetAmount,
      shiftSummaries: input.shiftSummaries,
      weeklyBudget,
      zoneBreakdown,
    }),
    totalCost,
    totalMinutes,
    weeklyBudget,
    zoneBreakdown,
  }
}

function toBreakdownRow({
  id,
  label,
  summary,
  totalMinutes,
  weeklyBudget,
}: {
  id: string
  label: string
  summary: {
    totalCost: number
    totalMinutes: number
    totalShifts: number
  }
  totalMinutes: number
  weeklyBudget: number | null
}): BudgetBreakdownRow {
  const targetCost =
    weeklyBudget === null || totalMinutes <= 0
      ? null
      : weeklyBudget * (summary.totalMinutes / totalMinutes)

  return {
    id,
    label,
    targetCost,
    totalCost: summary.totalCost,
    totalMinutes: summary.totalMinutes,
    totalShifts: summary.totalShifts,
    variance: targetCost === null ? null : targetCost - summary.totalCost,
  }
}

function buildSuggestions({
  dayBreakdown,
  overBudgetAmount,
  shiftSummaries,
  weeklyBudget,
  zoneBreakdown,
}: {
  dayBreakdown: BudgetBreakdownRow[]
  overBudgetAmount: number
  shiftSummaries: ScheduledShiftCostSummary[]
  weeklyBudget: number | null
  zoneBreakdown: BudgetBreakdownRow[]
}): BudgetSuggestion[] {
  const suggestions: BudgetSuggestion[] = []

  if (weeklyBudget === null) {
    suggestions.push({
      detail: "Set a weekly target so RocketRota can flag expensive days and zones while you build the rota.",
      estimatedSaving: null,
      id: "set-budget",
      title: "Set a weekly labour budget",
    })
  } else if (overBudgetAmount > 0) {
    suggestions.push({
      detail: "Review the largest over-target days before publishing.",
      estimatedSaving: overBudgetAmount,
      id: "over-budget",
      title: "Bring the rota back inside budget",
    })
  }

  const overDay = getLargestOverTarget(dayBreakdown)
  if (overDay) {
    suggestions.push({
      detail: `${overDay.label} is the furthest over its hour-weighted share of the weekly budget.`,
      estimatedSaving: Math.abs(overDay.variance ?? 0),
      id: `day-${overDay.id}`,
      title: `Review ${overDay.label}`,
    })
  }

  const overZone = getLargestOverTarget(zoneBreakdown)
  if (overZone) {
    suggestions.push({
      detail: `${overZone.label} has the highest over-target cost for the hours scheduled.`,
      estimatedSaving: Math.abs(overZone.variance ?? 0),
      id: `zone-${overZone.id}`,
      title: `Check ${overZone.label}`,
    })
  }

  const trimCandidates = shiftSummaries
    .filter((shift) => shift.assignedCount > 1 && shift.totalMinutes >= 120)
    .map((shift) => ({
      ...shift,
      estimatedSaving: getTrimSaving(shift),
    }))
    .filter((shift) => shift.estimatedSaving > 0)
    .sort((left, right) => right.estimatedSaving - left.estimatedSaving)
    .slice(0, 2)

  for (const shift of trimCandidates) {
    suggestions.push({
      detail: `${shift.zoneName}, ${shift.timeLabel}. Shortening this by 30 minutes across assigned staff is a low-risk first check.`,
      estimatedSaving: shift.estimatedSaving,
      id: `trim-${shift.shiftId}`,
      title: "Try a shorter staffed window",
    })
  }

  return suggestions.slice(0, 5)
}

function buildGuardrails(
  shiftSummaries: ScheduledShiftCostSummary[],
  dayLabelById: Record<string, string>
): BudgetGuardrail[] {
  const uncovered = shiftSummaries
    .filter((shift) => shift.assignedCount === 0)
    .slice(0, 3)
    .map((shift) => ({
      detail: `${dayLabelById[shift.dayId] ?? "Day"}, ${shift.zoneName}, ${shift.timeLabel}`,
      id: `uncovered-${shift.shiftId}`,
      title: "Unassigned shift",
    }))

  const singleCover = shiftSummaries
    .filter((shift) => shift.assignedCount === 1 && shift.totalMinutes >= 240)
    .slice(0, 3)
    .map((shift) => ({
      detail: `${dayLabelById[shift.dayId] ?? "Day"}, ${shift.zoneName}, ${shift.timeLabel}`,
      id: `single-cover-${shift.shiftId}`,
      title: "Cut carefully: single cover",
    }))

  return [...uncovered, ...singleCover].slice(0, 5)
}

function getLargestOverTarget(rows: BudgetBreakdownRow[]) {
  return rows
    .filter((row) => row.variance !== null && row.variance < 0)
    .sort((left, right) => (left.variance ?? 0) - (right.variance ?? 0))[0]
}

function getTrimSaving(shift: ScheduledShiftCostSummary) {
  if (shift.totalMinutes <= 0) {
    return 0
  }

  const costPerMinute = shift.totalCost / shift.totalMinutes
  return costPerMinute * Math.min(30 * shift.assignedCount, shift.totalMinutes)
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

export { buildBudgetInsights }
export type {
  BudgetBreakdownRow,
  BudgetGuardrail,
  BudgetInsights,
  BudgetSuggestion,
}
