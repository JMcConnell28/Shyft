import { beforeEach, describe, expect, it, vi } from "vitest"
import { listAccessibleLocations, listPermittedRotaLocations } from "./access"
import {
  getSeenPublishedVersionsMap,
  listPublishedRotasForLocations,
} from "./related-data"

const mocks = vi.hoisted(() => ({ from: vi.fn(), eq: vi.fn() }))
vi.mock("@/lib/supabase.server", () => ({
  createSupabaseServerClient: () => ({ from: mocks.from }),
}))
vi.mock("./related-data", () => ({
  listPublishedRotasForLocations: vi.fn(),
  getSeenPublishedVersionsMap: vi.fn(),
}))
vi.mock("./membership", () => ({ getMembershipRole: vi.fn() }))
vi.mock("@/lib/auth/has-location-permission", () => ({
  getLocationRole: vi.fn(),
}))
vi.mock("@/lib/db", () => ({ getDatabase: vi.fn() }))

beforeEach(() => {
  vi.resetAllMocks()
  const query = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: mocks.eq,
  }
  mocks.from.mockReturnValue(query)
  mocks.eq.mockResolvedValue({
    data: [{ id: "loc", name: "Workplace", slug: "workplace" }],
    error: null,
  })
})
describe("location access without unrelated read-state queries", () => {
  it("authorizes a manager's tenant without fetching published/read records", async () => {
    const locations = await listPermittedRotaLocations("org", "user", "manager")
    expect(locations).toHaveLength(1)
    expect(mocks.eq).toHaveBeenCalledWith("organization_id", "org")
    expect(listPublishedRotasForLocations).not.toHaveBeenCalled()
    expect(getSeenPublishedVersionsMap).not.toHaveBeenCalled()
  })
  it("retains unread calculation for callers that need it", async () => {
    vi.mocked(listPublishedRotasForLocations).mockResolvedValue([
      {
        id: "rota",
        location_id: "loc",
        published_by_user_id: "another-user",
        published_version: 2,
      },
    ])
    vi.mocked(getSeenPublishedVersionsMap).mockResolvedValue(
      new Map([["rota", 1]])
    )
    expect(await listAccessibleLocations("org", "user", "manager")).toEqual([
      {
        id: "loc",
        name: "Workplace",
        slug: "workplace",
        hasUnreadPublished: true,
      },
    ])
    expect(getSeenPublishedVersionsMap).toHaveBeenCalledWith(["rota"], "user")
  })
})
