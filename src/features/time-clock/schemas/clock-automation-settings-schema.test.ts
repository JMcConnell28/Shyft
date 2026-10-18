import { describe, expect, it } from "vitest"
import { clockAutomationSettingsSchema } from "./clock-automation-settings-schema"
import { updateClockSettingsInputSchema } from "./time-clock-schemas"

const defaults = {
  forgottenClockOutAlertMinutes: 15,
  hardReviewAfterMinutes: 120,
  unscheduledClockOutAfterMinutes: 480,
  unscheduledClockOutReminderMinutes: 15,
}

describe("location clock-out policy validation", () => {
  it("accepts the defaults and exact custom minute values", () => {
    expect(clockAutomationSettingsSchema.parse(defaults)).toEqual(defaults)
    expect(
      clockAutomationSettingsSchema.safeParse({
        forgottenClockOutAlertMinutes: 23,
        hardReviewAfterMinutes: 97,
        unscheduledClockOutAfterMinutes: 610,
        unscheduledClockOutReminderMinutes: 19,
      }).success
    ).toBe(true)
  })
  it.each([
    { forgottenClockOutAlertMinutes: 120 },
    { hardReviewAfterMinutes: 15 },
    { unscheduledClockOutAfterMinutes: 30 },
    { unscheduledClockOutReminderMinutes: 480 },
    { forgottenClockOutAlertMinutes: 0 },
    { hardReviewAfterMinutes: 2881 },
    { unscheduledClockOutAfterMinutes: 90.5 },
  ])("rejects an invalid policy: %o", (patch) => {
    expect(
      clockAutomationSettingsSchema.safeParse({ ...defaults, ...patch }).success
    ).toBe(false)
  })
  it("retains the policy checks in the full settings server input", () => {
    const input = {
      ...defaults,
      userId: "manager",
      locationId: "20000000-0000-4000-8000-000000000001",
      isEnabled: true,
      latitude: null,
      longitude: null,
      radiusMeters: 75,
      maxAccuracyMeters: 150,
      timezone: "Europe/London",
      earlyClockInGraceMinutes: 10,
      earlyStartReviewMinutes: 15,
      lateClockInGraceMinutes: 5,
      lateClockOutGraceMinutes: 10,
      lateFinishReviewMinutes: 15,
      lateStartReviewMinutes: 15,
    }
    expect(updateClockSettingsInputSchema.safeParse(input).success).toBe(true)
    expect(
      updateClockSettingsInputSchema.safeParse({
        ...input,
        hardReviewAfterMinutes: 15,
      }).success
    ).toBe(false)
    expect(
      updateClockSettingsInputSchema.safeParse({
        ...input,
        unscheduledClockOutReminderMinutes: 480,
      }).success
    ).toBe(false)
  })
})
