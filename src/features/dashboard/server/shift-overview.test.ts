import { beforeEach, describe, expect, it, vi } from "vitest"
import { getDashboardShiftOverview } from "./shift-overview"

const mock = vi.hoisted(() => ({
  locations: vi.fn(),
  query: vi.fn(),
  entitlements: vi.fn(),
}))
vi.mock("@/features/billing/server/entitlements", () => ({
  listLocationEntitlements: mock.entitlements,
}))
vi.mock("@/features/rota/server/access", () => ({
  listPermittedRotaLocations: mock.locations,
  listAccessibleLocations: () => {
    throw new Error("Unread metadata is not needed")
  },
}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query: mock.query }) }))
vi.mock("@/lib/auth/has-location-permission", () => ({
  getLocationRole: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe("personal overview location access", () => {
  it("keeps organisation/user scoping and avoids queries without permitted locations", async () => {
    mock.locations.mockResolvedValue([])
    const result = await getDashboardShiftOverview({
      organizationId: "org",
      userId: "user",
    })
    expect(mock.locations).toHaveBeenCalledWith("org", "user")
    expect(mock.query).not.toHaveBeenCalled()
    expect(result.clockStatus).toBeNull()
  })

  it("uses permitted locations without fetching unread published-rota metadata", async () => {
    mock.locations.mockResolvedValue([
      { id: "location", name: "Location", slug: "location" },
    ])
    mock.query.mockResolvedValue({ rows: [] })
    await getDashboardShiftOverview({ organizationId: "org", userId: "user" })
    expect(mock.query).toHaveBeenCalledTimes(1)
    expect(mock.query.mock.calls[0][1]).toEqual(["user", ["location"], "org"])
  })

  it("keeps the schedule available and skips clock queries when Time & Attendance is inactive", async () => {
    mock.locations.mockResolvedValue([{ id: "location" }])
    mock.entitlements.mockResolvedValue([
      { locationId: "location", timeAttendanceEnabled: false },
    ])
    mock.query
      .mockResolvedValueOnce({ rows: [{ id: "employee" }] })
      .mockResolvedValue({ rows: [] })
    const result = await getDashboardShiftOverview({
      organizationId: "org",
      userId: "user",
    })
    expect(result.clockStatus).toBeNull()
    expect(mock.query).toHaveBeenCalledWith(
      expect.stringContaining("from public.rota_published_shift_assignments"),
      expect.any(Array)
    )
    expect(mock.query).not.toHaveBeenCalledWith(
      expect.stringContaining("from public.time_entries"),
      expect.any(Array)
    )
  })

  it("reads clock status only from permitted locations with the add-on", async () => {
    mock.locations.mockResolvedValue([{ id: "enabled" }, { id: "disabled" }])
    mock.entitlements.mockResolvedValue([
      { locationId: "enabled", timeAttendanceEnabled: true },
      { locationId: "disabled", timeAttendanceEnabled: false },
    ])
    mock.query
      .mockResolvedValueOnce({ rows: [{ id: "employee" }] })
      .mockResolvedValue({ rows: [] })
    const result = await getDashboardShiftOverview({
      organizationId: "org",
      userId: "user",
    })
    expect(result.clockStatus).toEqual({
      openEntry: null,
      completedTodayMs: 0,
      todayEntryCount: 0,
    })
    expect(mock.entitlements).toHaveBeenCalledWith(["enabled", "disabled"])
    expect(mock.query).toHaveBeenCalledWith(
      expect.stringContaining("from public.time_entries"),
      [["employee"], ["enabled"], expect.any(String)]
    )
  })
})
