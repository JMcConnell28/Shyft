import { describe, expect, it } from "vitest"

import {
  DEFAULT_MINIMUM_WAGE_PENCE,
  getAgeOnDate,
  getMinimumWagePenceForDateOfBirth,
} from "@/features/staff-groups/utils/minimum-wage"

describe("minimum wage utilities", () => {
  const currentRateDate = new Date("2026-06-16T12:00:00.000Z")

  it("calculates age at the supplied date", () => {
    expect(getAgeOnDate("2005-06-16", currentRateDate)).toBe(21)
    expect(getAgeOnDate("2005-06-17", currentRateDate)).toBe(20)
  })

  it("returns the 21 and over rate", () => {
    expect(
      getMinimumWagePenceForDateOfBirth("2005-06-16", currentRateDate)
    ).toBe(1271)
  })

  it("returns the 18 to 20 rate", () => {
    expect(
      getMinimumWagePenceForDateOfBirth("2006-06-17", currentRateDate)
    ).toBe(1085)
  })

  it("returns the under 18 rate", () => {
    expect(
      getMinimumWagePenceForDateOfBirth("2009-06-17", currentRateDate)
    ).toBe(800)
  })

  it("falls back to the adult rate without a usable date of birth", () => {
    expect(getMinimumWagePenceForDateOfBirth(null, currentRateDate)).toBe(
      DEFAULT_MINIMUM_WAGE_PENCE
    )
    expect(
      getMinimumWagePenceForDateOfBirth("not-a-date", currentRateDate)
    ).toBe(DEFAULT_MINIMUM_WAGE_PENCE)
  })
})
