import { describe, expect, it } from "vitest"

import type { BillingUsageEvent } from "@/features/billing/usage-types"
import { calculateBillingUsageQuantities } from "@/features/billing/utils/usage-quantities"

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
      timeAttendanceQuantity: 0,
    })
  })

  it("charges extra employees above the included organization allowance", () => {
    const events = Array.from({ length: 11 }, (_, index) =>
      usage(`employee-${index}`, false)
    )

    expect(calculateBillingUsageQuantities(events).extraEmployeeQuantity).toBe(
      1
    )
  })

  it("counts Time & Attendance employees once across enabled locations", () => {
    expect(
      calculateBillingUsageQuantities([
        usage("employee-1", true),
        usage("employee-1", true, "time_entry"),
        usage("employee-2", true),
      ]).timeAttendanceQuantity
    ).toBe(0)
  })

  it("does not add Time & Attendance charges for non-enabled location usage", () => {
    expect(
      calculateBillingUsageQuantities([
        usage("employee-1", false),
        usage("employee-2", true),
      ]).timeAttendanceQuantity
    ).toBe(0)
  })

  it("keeps deactivated employees billable when usage was captured", () => {
    expect(
      calculateBillingUsageQuantities([usage("inactive-employee", false)])
        .usedEmployeeQuantity
    ).toBe(1)
  })

  it.each([false, true])(
    "includes a small second location with T&A enabled: %s",
    (secondLocationEnabled) => {
      const events = [
        ...Array.from({ length: 20 }, (_, index) =>
          usage(`employee-${String(index).padStart(2, "0")}`, true)
        ),
        ...Array.from({ length: 8 }, (_, index) => ({
          ...usage(`other-${index}`, secondLocationEnabled),
          locationId: "location-2",
        })),
      ]
      expect(calculateBillingUsageQuantities(events)).toMatchObject({
        usedEmployeeQuantity: 28,
        extraEmployeeQuantity: 18,
        timeAttendanceQuantity: 10,
      })
    }
  )

  it("counts the same overage employees once across enabled locations", () => {
    const events = Array.from({ length: 12 }, (_, index) =>
      usage(`employee-${String(index).padStart(2, "0")}`, true)
    )
    expect(
      calculateBillingUsageQuantities([
        ...events,
        ...events.map((event) => ({ ...event, locationId: "location-2" })),
      ])
    ).toMatchObject({ extraEmployeeQuantity: 2, timeAttendanceQuantity: 2 })
  })

  it("charges nothing for enabling T&A at locations with up to 10 used staff", () => {
    const events = Array.from({ length: 10 }, (_, index) =>
      usage(`employee-${index}`, true)
    )
    expect(calculateBillingUsageQuantities(events).timeAttendanceQuantity).toBe(
      0
    )
  })
})

function usage(
  employeeId: string,
  timeAttendanceBillable: boolean,
  source: BillingUsageEvent["source"] = "published_rota_assignment"
): BillingUsageEvent {
  return {
    employeeId,
    locationId: "location-1",
    usageAt: "2026-06-01T09:00:00.000Z",
    source,
    timeAttendanceBillable,
  }
}
