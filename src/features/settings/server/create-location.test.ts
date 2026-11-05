import { beforeEach, describe, expect, it, vi } from "vitest"
import { createLocation } from "./create-location"

const { query, connect, release, access } = vi.hoisted(() => ({
  query: vi.fn(),
  connect: vi.fn(),
  release: vi.fn(),
  access: vi.fn(),
}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ connect }) }))
vi.mock("./location-write-access", () => ({
  requireSettingsLocationWriteAccess: access,
}))
const input = {
  organizationId: "org",
  userId: "user",
  name: "Cafe",
  businessType: "hospitality" as const,
  planningMode: "fixed_location" as const,
  zoneNames: ["Main", "Kitchen"],
  worksiteName: "",
}

beforeEach(() => {
  vi.resetAllMocks()
  connect.mockResolvedValue({ query, release })
  query.mockImplementation((sql: string) => {
    if (sql.includes("as exists"))
      return Promise.resolve({ rows: [{ exists: false }] })
    if (sql.startsWith("select slug"))
      return Promise.resolve({
        rows: [{ slug: "cafe" }, { slug: "cafe-2" }, { slug: "cafe-3" }],
      })
    if (sql.startsWith("insert into public.locations"))
      return Promise.resolve({
        rows: [
          {
            id: "location",
            name: "Cafe",
            slug: "cafe-4",
            estimated_closing_time: "23:00:00",
            estimated_closing_time_next_day: false,
          },
        ],
      })
    if (sql.includes("unnest"))
      return Promise.resolve({
        rows: [
          { id: "one", name: "Main", sort_order: 0 },
          { id: "two", name: "Kitchen", sort_order: 1 },
        ],
      })
    return Promise.resolve({ rows: [] })
  })
})

describe("location creation efficiency and atomicity", () => {
  it("allocates slug suffixes in one read and returns the new list item without refetching", async () => {
    const result = await createLocation(input)
    expect(result).toMatchObject({
      id: "location",
      slug: "cafe-4",
      zoneCount: 2,
      employeeCount: 0,
      estimatedClosingTime: "23:00",
    })
    expect(result.zones).toEqual([
      { id: "one", name: "Main", sortOrder: 0 },
      { id: "two", name: "Kitchen", sortOrder: 1 },
    ])
    expect(result.daySettings).toHaveLength(7)
    expect(query).toHaveBeenCalledTimes(7)
    expect(
      query.mock.calls.filter(([sql]) => String(sql).startsWith("select slug"))
    ).toHaveLength(1)
    expect(query).toHaveBeenLastCalledWith("COMMIT")
    expect(release).toHaveBeenCalledOnce()
  })
  it("inserts all initial zones in one parameterized query", async () => {
    const names = Array.from({ length: 12 }, (_, i) => `Zone ${i}`)
    await createLocation({ ...input, zoneNames: names })
    expect(
      query.mock.calls.filter(([sql]) =>
        String(sql).includes("insert into public.zones")
      )
    ).toHaveLength(1)
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("unnest($3::text[])"),
      ["org", "location", names]
    )
  })
  it("preserves serialized duplicate-name checks", async () => {
    query.mockResolvedValue({ rows: [{ exists: true }] })
    await expect(createLocation(input)).rejects.toThrow(
      "A location with this name already exists"
    )
    expect(query.mock.calls.map(([sql]) => String(sql))).toEqual([
      "BEGIN",
      expect.stringContaining("pg_advisory_xact_lock"),
      expect.stringContaining("as exists"),
      "ROLLBACK",
    ])
    expect(release).toHaveBeenCalledOnce()
  })
  it("does not connect or mutate when access fails", async () => {
    access.mockRejectedValue(new Error("Denied"))
    await expect(createLocation(input)).rejects.toThrow("Denied")
    expect(connect).not.toHaveBeenCalled()
    expect(query).not.toHaveBeenCalled()
  })
  it("rolls back and releases the connection if any initial zone fails", async () => {
    const original = query.getMockImplementation()
    query.mockImplementation((sql: string, values?: unknown) => {
      if (sql.includes("unnest"))
        return Promise.reject(new Error("Could not save zones"))
      return original?.(sql, values)
    })
    await expect(createLocation(input)).rejects.toThrow("Could not save zones")
    expect(query).toHaveBeenLastCalledWith("ROLLBACK")
    expect(query).not.toHaveBeenCalledWith("COMMIT")
    expect(release).toHaveBeenCalledOnce()
  })
})
