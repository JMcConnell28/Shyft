import { describe, expect, it } from "vitest"

import {
  formatElapsedSummary,
  formatElapsedTime,
  getElapsedMilliseconds,
} from "@/features/time-clock/utils/elapsed-time"

describe("elapsed time utilities", () => {
  it("formats live timer values under an hour", () => {
    expect(formatElapsedTime(125_000)).toBe("2:05")
  })

  it("formats live timer values over an hour", () => {
    expect(formatElapsedTime(3_725_000)).toBe("1:02:05")
  })

  it("formats compact dashboard summaries", () => {
    expect(formatElapsedSummary(7_500_000)).toBe("2h 5m")
  })

  it("never returns negative elapsed time", () => {
    const elapsed = getElapsedMilliseconds(
      "2026-06-07T12:00:00.000Z",
      new Date("2026-06-07T11:59:59.000Z"),
    )

    expect(elapsed).toBe(0)
  })
})
