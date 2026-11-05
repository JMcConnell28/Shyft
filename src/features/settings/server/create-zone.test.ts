import { beforeEach, describe, expect, it, vi } from "vitest"
import { createZone } from "./create-zone"

const { query, access } = vi.hoisted(() => ({
  query: vi.fn(),
  access: vi.fn(),
}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))
vi.mock("./location-write-access", () => ({
  requireSettingsLocationWriteAccess: access,
}))
beforeEach(() => vi.resetAllMocks())
const input = {
  organizationId: "org",
  locationId: "location",
  userId: "user",
  name: " Kitchen ",
}

describe("zone creation round trips", () => {
  it("validates location, uniqueness and sort order in one query", async () => {
    query.mockResolvedValue({
      rows: [
        {
          target_location_id: "location",
          id: "zone",
          name: "Kitchen",
          sort_order: 2,
        },
      ],
    })
    await expect(createZone(input)).resolves.toEqual({
      locationId: "location",
      id: "zone",
      name: "Kitchen",
      sortOrder: 2,
    })
    expect(query).toHaveBeenCalledOnce()
    expect(query).toHaveBeenCalledWith(expect.stringContaining("on conflict"), [
      "org",
      "location",
      "Kitchen",
    ])
  })
  it("does not write when billing or permission checks reject", async () => {
    access.mockRejectedValue(new Error("View-only"))
    await expect(createZone(input)).rejects.toThrow("View-only")
    expect(query).not.toHaveBeenCalled()
  })
  it("keeps cross-organisation locations inaccessible", async () => {
    query.mockResolvedValue({ rows: [] })
    await expect(createZone(input)).rejects.toThrow("Choose a valid location.")
  })
  it("returns the friendly duplicate message when the unique index prevents insertion", async () => {
    query.mockResolvedValue({
      rows: [
        {
          target_location_id: "location",
          id: null,
          name: null,
          sort_order: null,
        },
      ],
    })
    await expect(createZone(input)).rejects.toThrow(
      "That zone name already exists"
    )
  })
})
