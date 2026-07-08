import { describe, expect, it } from "vitest"

import {
  isDerryClockStationPostcode,
  normalizePostcode,
  timeAttendanceDeliveryAddressSchema,
} from "@/features/billing/schemas/time-attendance-addon-schemas"

describe("timeAttendanceDeliveryAddressSchema", () => {
  it("accepts BT47 and BT48 delivery postcodes", () => {
    expect(
      timeAttendanceDeliveryAddressSchema.safeParse(
        buildDeliveryAddress("bt47 2aa")
      ).success
    ).toBe(true)

    expect(
      timeAttendanceDeliveryAddressSchema.safeParse(
        buildDeliveryAddress("BT48 6DQ")
      ).success
    ).toBe(true)
  })

  it("rejects valid UK postcodes outside the Derry launch area", () => {
    expect(
      timeAttendanceDeliveryAddressSchema.safeParse(
        buildDeliveryAddress("BT1 5GS")
      ).success
    ).toBe(false)
  })
})

describe("isDerryClockStationPostcode", () => {
  it("matches BT47 and BT48 postcodes without depending on spacing or case", () => {
    expect(isDerryClockStationPostcode("bt47 3ab")).toBe(true)
    expect(isDerryClockStationPostcode("BT486CD")).toBe(true)
  })

  it("does not match other postcode prefixes", () => {
    expect(isDerryClockStationPostcode("BT49 0AB")).toBe(false)
    expect(isDerryClockStationPostcode("SW1A 1AA")).toBe(false)
  })
})

describe("normalizePostcode", () => {
  it("uppercases postcodes and removes spacing", () => {
    expect(normalizePostcode(" bt48  6dq ")).toBe("BT486DQ")
  })
})

function buildDeliveryAddress(postcode: string) {
  return {
    name: "Alex Manager",
    line1: "1 Strand Road",
    city: "Derry",
    postcode,
    country: "GB",
  }
}
