import { describe, expect, it } from "vitest"

import type { ClockSettingsValues } from "@/features/time-clock/types"
import { normalizeClockSettingsValues } from "@/features/time-clock/utils/clock-settings"

const SETTINGS: ClockSettingsValues = {
  earlyClockInGraceMinutes: 10,
  earlyStartReviewMinutes: 15,
  forgottenClockOutAlertMinutes: 120,
  hardReviewAfterMinutes: 720,
  isEnabled: true,
  lateClockInGraceMinutes: 5,
  lateClockOutGraceMinutes: 10,
  lateFinishReviewMinutes: 15,
  lateStartReviewMinutes: 15,
  latitude: null,
  longitude: null,
  maxAccuracyMeters: 150,
  radiusMeters: 75,
  timezone: "Europe/London",
}

describe("clock settings", () => {
  it("keeps review thresholds at or beyond their grace periods", () => {
    expect(
      normalizeClockSettingsValues(SETTINGS, {
        earlyClockInGraceMinutes: 30,
        lateClockInGraceMinutes: 30,
        lateClockOutGraceMinutes: 30,
      })
    ).toMatchObject({
      earlyStartReviewMinutes: 30,
      lateFinishReviewMinutes: 30,
      lateStartReviewMinutes: 30,
    })
  })

  it("keeps the hard review threshold after the alert threshold", () => {
    expect(
      normalizeClockSettingsValues(SETTINGS, {
        forgottenClockOutAlertMinutes: 960,
      }).hardReviewAfterMinutes
    ).toBe(960)
  })
})
