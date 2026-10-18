import { describe, expect, it } from "vitest"
import { getManualClockTime, toLocalClockInput } from "./manual-clock-time"
import { managerClockOverrideInputSchema } from "@/features/time-clock/schemas/time-clock-schemas"

describe("manual clock times", () => {
  const now = new Date("2026-10-18T10:00:00Z")
  it("defaults to now and accepts an earlier instant with a timezone offset", () => {
    expect(getManualClockTime(undefined, now)).toEqual(now)
    expect(
      getManualClockTime("2026-10-18T09:00:00+01:00", now).toISOString()
    ).toBe("2026-10-18T08:00:00.000Z")
  })
  it("rejects invalid and future instants", () => {
    expect(() => getManualClockTime("invalid", now)).toThrow("valid date")
    expect(() => getManualClockTime("2026-10-18T11:00:00Z", now)).toThrow(
      "future"
    )
  })
  it("uses device local time in the input without changing the selected instant", () => {
    const value = toLocalClockInput(now)
    expect(new Date(value).toISOString()).toBe(now.toISOString())
  })
  it("validates manager timestamps at the server boundary", () => {
    const input = {
      userId: "manager",
      employeeId: "10000000-0000-4000-8000-000000000001",
      locationId: "20000000-0000-4000-8000-000000000001",
      action: "clock_in",
      reason: "Station was unavailable.",
    }
    expect(
      managerClockOverrideInputSchema.safeParse({
        ...input,
        occurredAt: "2026-10-18T08:00:00Z",
      }).success
    ).toBe(true)
    expect(
      managerClockOverrideInputSchema.safeParse({
        ...input,
        occurredAt: "2026-10-18T08:00",
      }).success
    ).toBe(false)
  })
})
