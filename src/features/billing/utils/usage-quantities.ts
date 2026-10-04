import type {
  BillingUsageEvent,
  BillingUsageQuantities,
} from "@/features/billing/usage-types"
import {
  INCLUDED_CORE_EMPLOYEES,
  calculateBillingSeatQuantities,
} from "@/features/billing/utils/pricing-quantities"

function calculateBillingUsageQuantities(
  events: Array<BillingUsageEvent>
): BillingUsageQuantities {
  const usedEmployeeIds = new Set<string>()
  const timeAttendanceEmployeesByLocation = new Map<
    string,
    Map<string, string>
  >()

  for (const event of events) {
    usedEmployeeIds.add(event.employeeId)

    if (event.timeAttendanceBillable) {
      const employees =
        timeAttendanceEmployeesByLocation.get(event.locationId) ??
        new Map<string, string>()
      const firstUsage = employees.get(event.employeeId)
      employees.set(
        event.employeeId,
        firstUsage && firstUsage < event.usageAt ? firstUsage : event.usageAt
      )
      timeAttendanceEmployeesByLocation.set(event.locationId, employees)
    }
  }

  const seatQuantities = calculateBillingSeatQuantities(usedEmployeeIds.size)
  const timeAttendanceEmployeeIds = new Set<string>()

  for (const employees of timeAttendanceEmployeesByLocation.values()) {
    const orderedEmployees = Array.from(employees).sort(
      ([leftId, leftAt], [rightId, rightAt]) =>
        leftAt.localeCompare(rightAt) || leftId.localeCompare(rightId)
    )
    for (const [employeeId] of orderedEmployees.slice(
      INCLUDED_CORE_EMPLOYEES
    )) {
      timeAttendanceEmployeeIds.add(employeeId)
    }
  }

  return {
    ...seatQuantities,
    timeAttendanceQuantity: timeAttendanceEmployeeIds.size,
  }
}

export { calculateBillingUsageQuantities }
export type {
  BillableUsageSource,
  BillingUsageEvent,
  BillingUsageQuantities,
} from "@/features/billing/usage-types"
