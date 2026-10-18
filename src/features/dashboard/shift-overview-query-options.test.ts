import { QueryClient } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"
import { shiftOverviewQueryOptions } from "./shift-overview-query-options"
import type { DashboardShiftOverview } from "@/features/dashboard/types"
import { timeClockQueryKeys } from "@/features/time-clock/query-keys"

vi.mock("@/features/dashboard/server-fns", () => ({
  getDashboardShiftOverview: vi.fn(),
}))

describe("personal dashboard attendance refresh", () => {
  it("polls while clocked in and stops after the server closes the entry", () => {
    const client = new QueryClient()
    const input = {
      organizationId: "org",
      userId: "employee",
    }
    const options = shiftOverviewQueryOptions(input)
    const query = client.getQueryCache().build(client, {
      queryKey: timeClockQueryKeys.dashboard(input),
      queryFn: options.queryFn,
    })
    const interval = options.refetchInterval
    if (typeof interval !== "function")
      throw new Error("Expected a polling policy.")
    const overview: DashboardShiftOverview = {
      clockStatus: {
        completedTodayMs: 0,
        todayEntryCount: 1,
        openEntry: {
          id: "entry",
          clockedInAt: "2026-10-18T08:00:00Z",
          locationName: "Cafe",
          source: "employee_nfc",
          status: "open",
        },
      },
      nextShift: null,
      thisWeekShifts: [],
      weekHoursLabel: null,
      weekRangeLabel: "This week",
    }
    query.setData(overview)
    expect(interval(query)).toBe(30_000)
    query.setData({
      ...overview,
      clockStatus: { ...overview.clockStatus, openEntry: null },
    })
    expect(interval(query)).toBe(false)
    client.clear()
  })
})
