import { describe, expect, it } from "vitest"
import { needsTimeAttendanceSetup } from "./time-attendance-access"
import type { BillingPeriodUsage } from "@/features/billing/types"

const location: BillingPeriodUsage = {
  locationId: "location",
  locationName: "Cafe",
  usedEmployeeCount: 0,
  includedEmployeeCount: 10,
  extraEmployeeCount: 0,
  timeAttendanceEnabled: false,
  timeAttendanceStatus: null,
  timeAttendanceCancelAt: null,
  hardwareEntitlementAvailable: true,
}

describe("clocking setup access", () => {
  it("offers setup before loading clock data for disabled locations", () => {
    expect(needsTimeAttendanceSetup({ locations: [location] })).toBe(true)
    expect(needsTimeAttendanceSetup({ locations: [location] }, true)).toBe(true)
  })
  it("preserves access when any location has attendance enabled", () => {
    expect(
      needsTimeAttendanceSetup({
        locations: [location, { ...location, timeAttendanceEnabled: true }],
      })
    ).toBe(false)
  })
  it("allows station activation in settings while gating activity", () => {
    const billing = {
      locations: [{ ...location, hardwareEntitlementAvailable: false }],
    }
    expect(needsTimeAttendanceSetup(billing)).toBe(true)
    expect(needsTimeAttendanceSetup(billing, true)).toBe(false)
  })
  it("does not mistake unknown billing or no locations for disabled attendance", () => {
    expect(needsTimeAttendanceSetup(null)).toBe(false)
    expect(needsTimeAttendanceSetup({ locations: [] })).toBe(false)
  })
})
