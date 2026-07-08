import { describe, expect, it } from "vitest"

import { calculateBillingSeatQuantities } from "@/features/billing/utils/pricing-quantities"

describe("calculateBillingSeatQuantities", () => {
  it.each([
    { activeEmployees: 0, extraEmployees: 0 },
    { activeEmployees: 1, extraEmployees: 0 },
    { activeEmployees: 10, extraEmployees: 0 },
    { activeEmployees: 11, extraEmployees: 1 },
    { activeEmployees: 40, extraEmployees: 30 },
  ])(
    "calculates extra employees for $activeEmployees active employees",
    ({ activeEmployees, extraEmployees }) => {
      expect(calculateBillingSeatQuantities(activeEmployees)).toEqual({
        activeEmployeeQuantity: activeEmployees,
        includedEmployeeQuantity: 10,
        extraEmployeeQuantity: extraEmployees,
      })
    }
  )
})
