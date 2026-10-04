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
    expect(pricing.totalPrice).toBe(100)
  })

  it("includes T&A for a location with fewer than 10 used staff", () => {
    const pricing = calculatePricing({
      locations: [
        { employeeCount: 8, timeAttendanceEnabled: true },
        { employeeCount: 12, timeAttendanceEnabled: false },
      ],
    })

    expect(pricing.timeAttendancePrice).toBe(0)
    expect(pricing.totalPrice).toBe(50)
  })

  it.each([false, true])(
    "charges T&A only above 10 per location (small location enabled: %s)",
    (timeAttendanceEnabled) => {
      const pricing = calculatePricing({
        locations: [
          { employeeCount: 20, timeAttendanceEnabled: true },
          { employeeCount: 8, timeAttendanceEnabled },
        ],
      })
      expect(pricing.extraEmployees).toBe(18)
      expect(pricing.timeAttendancePrice).toBe(10)
      expect(pricing.totalPrice).toBe(80)
    }
  )

  it("charges £3.50 for each extra employee using T&A after 10", () => {
    expect(
      calculatePricing({
        locations: [{ employeeCount: 11, timeAttendanceEnabled: true }],
      }).totalPrice
    ).toBe(28.5)
  })
})
