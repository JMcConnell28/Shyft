import { describe, expect, it } from "vitest"

import {
  calculateBillingUsageQuantities,
  type BillingUsageEvent,
} from "@/features/billing/utils/usage-quantities"

describe("calculateBillingUsageQuantities", () => {
  it("does not bill active employees that have no usage events", () => {
    expect(calculateBillingUsageQuantities([])).toEqual({
      usedEmployeeQuantity: 0,
      includedEmployeeQuantity: 10,
      extraEmployeeQuantity: 0,
      timeAttendanceQuantity: 0,
    })
  })

  it("counts employees once across multiple locations and usage sources", () => {
    expect(
      calculateBillingUsageQuantities([
        usage("employee-1", false),
        usage("employee-1", true, "time_entry"),
        usage("employee-2", false),
      ])
    ).toEqual({
      usedEmployeeQuantity: 2,
      includedEmployeeQuantity: 10,
      extraEmployeeQuantity: 0,
      timeAttendanceQuantity: 1,
    })
  })

  it("charges extra employees above the included organization allowance", () => {
    const events = Array.from({ length: 11 }, (_, index) =>
      usage(`employee-${index}`, false)
    )

    expect(calculateBillingUsageQuantities(events).extraEmployeeQuantity).toBe(1)
  })

  it("counts Time & Attendance employees once across enabled locations", () => {
    expect(
      calculateBillingUsageQuantities([
        usage("employee-1", true),
        usage("employee-1", true, "time_entry"),
        usage("employee-2", true),
      ]).timeAttendanceQuantity
    ).toBe(2)
  })

  it("does not add Time & Attendance charges for non-enabled location usage", () => {
    expect(
      calculateBillingUsageQuantities([
        usage("employee-1", false),
        usage("employee-2", true),
      ]).timeAttendanceQuantity
    ).toBe(1)
  })

  it("keeps deactivated employees billable when usage was captured", () => {
    expect(
      calculateBillingUsageQuantities([usage("inactive-employee", false)])
        .usedEmployeeQuantity
    ).toBe(1)
  })
})

function usage(
  employeeId: string,
  timeAttendanceBillable: boolean,
  source: BillingUsageEvent["source"] = "published_rota_assignment"
): BillingUsageEvent {
  return {
    employeeId,
    source,
    timeAttendanceBillable,
  }
}
