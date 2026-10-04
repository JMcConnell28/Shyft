type BillableUsageSource = "published_rota_assignment" | "time_entry"

type BillingUsageEvent = {
  employeeId: string
  locationId: string
  usageAt: string
  source: BillableUsageSource
  timeAttendanceBillable: boolean
}

type BillingUsageQuantities = {
  usedEmployeeQuantity: number
  includedEmployeeQuantity: number
  extraEmployeeQuantity: number
  timeAttendanceQuantity: number
}

export type { BillableUsageSource, BillingUsageEvent, BillingUsageQuantities }
