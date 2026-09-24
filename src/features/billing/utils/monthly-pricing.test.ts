import { describe, expect, it } from "vitest"

import {
  formatMonthlyPrice,
  getMonthlyPricing,
} from "@/features/billing/utils/monthly-pricing"

describe("getMonthlyPricing", () => {
  it("includes the core price and charges only for billable usage", () => {
    expect(
      getMonthlyPricing({
        extraEmployeeQuantity: 0,
        timeAttendanceQuantity: 0,
      })
    ).toMatchObject({ totalPrice: 2_500 })

    expect(
      getMonthlyPricing({
        extraEmployeeQuantity: 3,
        timeAttendanceQuantity: 5,
      })
    ).toEqual({
      extraEmployeePrice: 750,
      timeAttendancePrice: 500,
      totalPrice: 3_750,
    })
  })

  it("formats pence as GBP", () => {
    expect(formatMonthlyPrice(3_750)).toBe("£37.50")
  })
})
