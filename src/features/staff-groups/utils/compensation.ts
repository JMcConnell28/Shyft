import type { EmployeeCompensationInput } from "@/features/staff-groups/types"
import { DEFAULT_MINIMUM_WAGE_PENCE } from "@/features/staff-groups/utils/minimum-wage"

function formatPence(pence: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pence / 100)
}

function formatEmployeeCompensation(compensation: EmployeeCompensationInput) {
  return compensation.type === "hourly"
    ? `${formatPence(compensation.hourlyRatePence)}/hr`
    : `${formatPence(compensation.weeklySalaryPence)}/week`
}

function poundsToPence(value: string) {
  const pounds = Number(value)
  return Number.isFinite(pounds) && pounds >= 0
    ? Math.round(pounds * 100)
    : null
}

export {
  DEFAULT_MINIMUM_WAGE_PENCE,
  formatEmployeeCompensation,
  formatPence,
  poundsToPence,
}
