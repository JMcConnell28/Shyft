import { calculateBillingSeatQuantities } from "@/features/billing/utils/pricing-quantities"

type BillableUsageSource = "published_rota_assignment" | "time_entry"

type BillingUsageEvent = {
  employeeId: string
  source: BillableUsageSource
  timeAttendanceBillable: boolean
}

type BillingUsageQuantities = {
  usedEmployeeQuantity: number
  includedEmployeeQuantity: number
  extraEmployeeQuantity: number
  timeAttendanceQuantity: number
}

function calculateBillingUsageQuantities(
  events: BillingUsageEvent[]
): BillingUsageQuantities {
  const usedEmployeeIds = new Set<string>()
  const timeAttendanceEmployeeIds = new Set<string>()

  for (const event of events) {
    usedEmployeeIds.add(event.employeeId)

    if (event.timeAttendanceBillable) {
      timeAttendanceEmployeeIds.add(event.employeeId)
    }
  }

  const seatQuantities = calculateBillingSeatQuantities(usedEmployeeIds.size)

  return {
    ...seatQuantities,
    timeAttendanceQuantity: timeAttendanceEmployeeIds.size,
  }
}

export { calculateBillingUsageQuantities }
export type { BillableUsageSource, BillingUsageEvent, BillingUsageQuantities }
