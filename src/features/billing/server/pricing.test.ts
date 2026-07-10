import { describe, expect, it } from "vitest"

import { calculateBillingSeatQuantities } from "@/features/billing/utils/pricing-quantities"

describe("calculateBillingSeatQuantities", () => {
  it.each([
    { usedEmployees: 0, extraEmployees: 0 },
    { usedEmployees: 1, extraEmployees: 0 },
    { usedEmployees: 10, extraEmployees: 0 },
    { usedEmployees: 11, extraEmployees: 1 },
    { usedEmployees: 40, extraEmployees: 30 },
  ])(
    "calculates extra employees for $usedEmployees used employees",
    ({ usedEmployees, extraEmployees }) => {
      expect(calculateBillingSeatQuantities(usedEmployees)).toEqual({
        usedEmployeeQuantity: usedEmployees,
        includedEmployeeQuantity: 10,
        extraEmployeeQuantity: extraEmployees,
      })
    }
  )
})
