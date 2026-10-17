import { describe, expect, it, vi } from "vitest"
import {
  managerAttentionOptions,
  managerDashboardKeys,
  managerDayOptions,
} from "./query-options"
import { dashboardLocation } from "./test-fixtures"
import { getDashboardPollingInterval } from "./utils/polling"

vi.mock("./server-fns", () => ({
  getManagerDashboardAccess: vi.fn(),
  getManagerDashboardDay: vi.fn(),
  getManagerDashboardAttention: vi.fn(),
}))
describe("dashboard query scope and polling", () => {
  it("keeps outstanding items in the same cache while the selected date changes", () => {
    const key = managerAttentionOptions("org", 1, "user").queryKey
    expect(key).toEqual(managerDashboardKeys.attention("org", 1, "user"))
    expect(
      managerDayOptions(
        { organizationId: "org", locationId: "loc", date: "2026-10-16" },
        "user"
      ).queryKey
    ).not.toEqual(
      managerDayOptions(
        { organizationId: "org", locationId: "loc", date: "2026-09-01" },
        "user"
      ).queryKey
    )
    expect(key).not.toContain("2026-10-16")
  })
  it("isolates data cached by two users in the same organisation", () => {
    expect(managerDashboardKeys.attention("org", 1, "owner")).not.toEqual(
      managerDashboardKeys.attention("org", 1, "supervisor")
    )
  })
  it("polls current attendance, stops on historical dates, and takes a final snapshot at midnight", () => {
    const data = { location: dashboardLocation, isToday: true }
    expect(
      getDashboardPollingInterval(
        "2026-10-16",
        data,
        new Date("2026-10-16T10:00:00Z")
      )
    ).toBe(30000)
    expect(
      getDashboardPollingInterval(
        "2026-10-16",
        data,
        new Date("2026-10-17T10:00:00Z")
      )
    ).toBe(1000)
    expect(
      getDashboardPollingInterval(
        "2026-10-16",
        { ...data, isToday: false },
        new Date("2026-10-17T10:00:00Z")
      )
    ).toBe(false)
    expect(
      getDashboardPollingInterval(undefined, {
        location: { ...dashboardLocation, attendanceEnabled: false },
        isToday: true,
      })
    ).toBe(60000)
  })
})
