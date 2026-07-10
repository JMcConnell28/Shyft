import { describe, expect, it } from "vitest"

import { calculatePricing } from "@/features/marketing/utils/pricing"

describe("calculatePricing", () => {
  it("includes the first 10 used employees in the base price", () => {
    const pricing = calculatePricing({
      locations: [
        { employeeCount: 4, timeAttendanceEnabled: false },
        { employeeCount: 6, timeAttendanceEnabled: false },
      ],
    })

    expect(pricing.extraEmployees).toBe(0)
    expect(pricing.extraPrice).toBe(0)
    expect(pricing.totalPrice).toBe(25)
  })

  it("charges extra employees across the organisation", () => {
    const pricing = calculatePricing({
      locations: [
        { employeeCount: 10, timeAttendanceEnabled: true },
        { employeeCount: 30, timeAttendanceEnabled: false },
      ],
    })

    expect(pricing.extraEmployees).toBe(30)
    expect(pricing.extraPrice).toBe(75)
    expect(pricing.totalPrice).toBe(110)
  })

  it("adds Time & Attendance per employee in enabled locations", () => {
    const pricing = calculatePricing({
      locations: [
        { employeeCount: 8, timeAttendanceEnabled: true },
        { employeeCount: 12, timeAttendanceEnabled: false },
      ],
    })

    expect(pricing.timeAttendancePrice).toBe(8)
    expect(pricing.totalPrice).toBe(58)
  })
})
