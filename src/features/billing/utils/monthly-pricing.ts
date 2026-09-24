import type { WorkspaceBillingState } from "@/features/billing/types"

const CORE_MONTHLY_PRICE_PENCE = 2_500
const EXTRA_EMPLOYEE_MONTHLY_PRICE_PENCE = 250
const TIME_ATTENDANCE_MONTHLY_PRICE_PENCE = 100

function getMonthlyPricing(
  billing: Pick<
    WorkspaceBillingState,
    "extraEmployeeQuantity" | "timeAttendanceQuantity"
  >
) {
  const extraEmployeePrice =
    billing.extraEmployeeQuantity * EXTRA_EMPLOYEE_MONTHLY_PRICE_PENCE
  const timeAttendancePrice =
    billing.timeAttendanceQuantity * TIME_ATTENDANCE_MONTHLY_PRICE_PENCE

  return {
    extraEmployeePrice,
    timeAttendancePrice,
    totalPrice:
      CORE_MONTHLY_PRICE_PENCE + extraEmployeePrice + timeAttendancePrice,
  }
}

function formatMonthlyPrice(pence: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100)
}

export {
  CORE_MONTHLY_PRICE_PENCE,
  EXTRA_EMPLOYEE_MONTHLY_PRICE_PENCE,
  TIME_ATTENDANCE_MONTHLY_PRICE_PENCE,
  formatMonthlyPrice,
  getMonthlyPricing,
}
