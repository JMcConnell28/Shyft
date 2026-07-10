import { describe, expect, it } from "vitest"

import {
  getMinutesBetween,
  getTimesheetWeek,
} from "@/features/timesheets/utils/timesheet-time"

describe("timesheet time utilities", () => {
  it("normalizes a date to the Monday-start work week", () => {
    const week = getTimesheetWeek("2026-06-07")

    expect(week.weekStart).toBe("2026-06-01")
    expect(week.weekEnd).toBe("2026-06-07")
    expect(week.days).toHaveLength(7)
  })

  it("calculates minutes using a fallback end for open entries", () => {
    expect(
      getMinutesBetween(
        "2026-06-07T09:00:00.000Z",
        null,
        new Date("2026-06-07T11:30:00.000Z"),
      ),
    ).toBe(150)
  })
})
