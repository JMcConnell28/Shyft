import { beforeEach, describe, expect, it, vi } from "vitest"
import { getDashboardShiftOverview } from "./shift-overview"

const mock = vi.hoisted(() => ({ locations: vi.fn(), query: vi.fn() }))
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
    expect(result.clockStatus.openEntry).toBeNull()
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
})
