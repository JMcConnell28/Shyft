import { beforeEach, describe, expect, it, vi } from "vitest"
import { setupRequestTag } from "./tag-setup"

const { query, audit, generate, release } = vi.hoisted(() => ({
  query: vi.fn(),
  audit: vi.fn(),
  generate: vi.fn(),
  release: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@rocketrota/db", () => ({
  getDatabase: () => ({ connect: () => Promise.resolve({ query, release }) }),
}))
vi.mock("@/features/audit/server/audit-log", () => ({
  writeAdminAuditLog: audit,
}))
vi.mock("@/features/clock-stations/server/actions", () => ({
  generateClockStationTag: generate,
}))
const input = {
  requestId: "additional:00000000-0000-4000-8000-000000000001",
  tagId: "00000000-0000-4000-8000-000000000002",
}
beforeEach(() => {
  vi.clearAllMocks()
  query.mockResolvedValue({ rows: [] })
  query
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({
      rows: [
        {
          location_id: "location",
          clock_tag_id: null,
          fulfillment_status: "pending",
        },
      ],
    })
  audit.mockResolvedValue(undefined)
})
describe("physical station tag assignment", () => {
  it("rejects a tag already assigned to another included or additional station", async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: input.tagId }] })
      .mockResolvedValueOnce({ rows: [{ request_id: "included:other" }] })
    await expect(setupRequestTag(input, "admin")).rejects.toThrow(
      "already assigned"
    )
    expect(query).toHaveBeenLastCalledWith("rollback")
    expect(audit).not.toHaveBeenCalled()
  })
  it("rejects a tag from another location or an inactive tag", async () => {
    query.mockResolvedValueOnce({ rows: [] })
    await expect(setupRequestTag(input, "admin")).rejects.toThrow(
      "active NFC tag for this location"
    )
    expect(query).toHaveBeenLastCalledWith("rollback")
  })
  it("assigns one tag and audits the exact additional request in one transaction", async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: input.tagId }] })
      .mockResolvedValueOnce({ rows: [] })
    await setupRequestTag(input, "admin")
    expect(
      query.mock.calls.some(([sql]) =>
        String(sql).includes("update billing_private.clock_station_purchases")
      )
    ).toBe(true)
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        targetId: input.requestId,
        afterState: { tagId: input.tagId },
      }),
      expect.objectContaining({ query })
    )
    expect(query).toHaveBeenLastCalledWith("commit")
  })
})
