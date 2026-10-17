import { describe, expect, it } from "vitest"
import {
  formatAttentionDate,
  getDashboardDayWindow,
  getDashboardWeekStart,
  moveDashboardDate,
} from "./date"

describe("manager dashboard local dates", () => {
  it.each([
    ["2026-03-29", 23],
    ["2026-10-25", 25],
    ["2026-10-16", 24],
  ])("uses real local midnight boundaries on %s", (date, hours) => {
    const window = getDashboardDayWindow(String(date), "Europe/London")
    expect((Date.parse(window.end) - Date.parse(window.start)) / 3600000).toBe(
      hours
    )
  })
  it("uses the selected location instead of the browser or server date", () => {
    expect(getDashboardDayWindow("2026-10-16", "America/New_York").start).toBe(
      "2026-10-16T04:00:00.000Z"
    )
    expect(moveDashboardDate("2026-12-31", 1)).toBe("2027-01-01")
    expect(getDashboardWeekStart("2026-10-18")).toBe("2026-10-12")
  })
  it("distinguishes today, yesterday and older unresolved items in their own timezone", () => {
    const now = new Date("2026-10-16T00:30:00Z")
    expect(
      formatAttentionDate("2026-10-15T23:30:00Z", "Europe/London", now)
    ).toContain("Today")
    expect(
      formatAttentionDate("2026-10-15T20:00:00Z", "Europe/London", now)
    ).toContain("Yesterday")
    expect(
      formatAttentionDate("2026-09-01T10:00:00Z", "Europe/London", now)
    ).toContain("1 Sep 2026")
  })
})
