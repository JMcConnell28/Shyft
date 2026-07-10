import { describe, expect, it } from "vitest"

import {
  getPayableClockIn,
  getPayableClockOut,
  type ClockPayRuleSettings,
} from "@/features/time-clock/utils/pay-rules"

const rules: ClockPayRuleSettings = {
  earlyClockInGraceMinutes: 10,
  earlyStartReviewMinutes: 15,
  forgottenClockOutAlertMinutes: 120,
  hardReviewAfterMinutes: 720,
  lateClockInGraceMinutes: 5,
  lateClockOutGraceMinutes: 10,
  lateFinishReviewMinutes: 15,
  lateStartReviewMinutes: 15,
}

const scheduledWindow = {
  startsAt: new Date("2026-06-07T09:00:00.000Z"),
  endsAt: new Date("2026-06-07T17:00:00.000Z"),
}

describe("pay rules", () => {
  it("pays early clock-ins inside the grace window from actual time", () => {
    const result = getPayableClockIn({
      actualClockInAt: new Date("2026-06-07T08:55:00.000Z"),
      rules,
      scheduledWindow,
    })

    expect(result.payableStartAt.toISOString()).toBe(
      "2026-06-07T08:55:00.000Z",
    )
    expect(result.reviewReason).toBeNull()
  })

  it("clips and reviews early clock-ins outside the review threshold", () => {
    const result = getPayableClockIn({
      actualClockInAt: new Date("2026-06-07T08:40:00.000Z"),
      rules,
      scheduledWindow,
    })

    expect(result.payableStartAt.toISOString()).toBe(
      "2026-06-07T09:00:00.000Z",
    )
    expect(result.reviewReason).toContain("20 minutes")
  })

  it("pays late clock-outs inside the grace window to actual time", () => {
    const result = getPayableClockOut({
      actualClockOutAt: new Date("2026-06-07T17:07:00.000Z"),
      rules,
      scheduledWindow,
    })

    expect(result.payableEndAt.toISOString()).toBe(
      "2026-06-07T17:07:00.000Z",
    )
    expect(result.reviewReason).toBeNull()
  })

  it("clips and reviews late clock-outs outside the review threshold", () => {
    const result = getPayableClockOut({
      actualClockOutAt: new Date("2026-06-07T17:35:00.000Z"),
      rules,
      scheduledWindow,
    })

    expect(result.payableEndAt.toISOString()).toBe(
      "2026-06-07T17:00:00.000Z",
    )
    expect(result.reviewReason).toContain("35 minutes")
  })
})
