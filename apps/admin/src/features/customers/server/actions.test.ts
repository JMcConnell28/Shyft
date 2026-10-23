import { beforeEach, describe, expect, it, vi } from "vitest"
import { updateFulfillment } from "./actions"

const { query, audit, release } = vi.hoisted(() => ({
  query: vi.fn(),
  audit: vi.fn(),
  release: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@rocketrota/db", () => ({
  getDatabase: () => ({ connect: () => Promise.resolve({ query, release }) }),
}))
vi.mock("@/features/audit/server/audit-log", () => ({
  writeAdminAuditLog: audit,
}))

const input = {
  requestId: "included:00000000-0000-4000-8000-000000000001",
  expectedStatus: "ready" as const,
  status: "shipped" as const,
  reference: "TRACK123",
  notes: "Packed",
}
beforeEach(() => {
  vi.clearAllMocks()
  query.mockResolvedValue({ rows: [] })
  audit.mockResolvedValue(undefined)
})
function station(status: string, paid = true) {
  query
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({
      rows: [
        {
          fulfillment_status: status,
          needs_station: paid,
          has_tag: true,
          has_delivery_address: true,
        },
      ],
    })
}
describe("station dispatch mutations", () => {
  it("rejects stale updates without changing hardware", async () => {
    station("shipped")
    await expect(updateFulfillment(input, "admin")).rejects.toThrow(
      "Another admin"
    )
    expect(
      query.mock.calls.some(([sql]) =>
        String(sql).startsWith("update billing_private")
      )
    ).toBe(false)
    expect(query).toHaveBeenLastCalledWith("rollback")
    expect(release).toHaveBeenCalled()
  })
  it("checks current payment eligibility at dispatch time", async () => {
    station("ready", false)
    await expect(updateFulfillment(input, "admin")).rejects.toThrow(
      "confirmed payment"
    )
    expect(audit).not.toHaveBeenCalled()
  })
  it("commits dispatch and its audit record together", async () => {
    station("ready")
    await updateFulfillment(input, "admin")
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "clock_station.fulfillment_updated",
        targetId: input.requestId,
      }),
      expect.objectContaining({ query })
    )
    expect(query).toHaveBeenLastCalledWith("commit")
    expect(release).toHaveBeenCalled()
  })
  it("rolls back dispatch when its audit record fails", async () => {
    station("ready")
    audit.mockRejectedValue(new Error("Audit unavailable"))
    await expect(updateFulfillment(input, "admin")).rejects.toThrow(
      "Audit unavailable"
    )
    expect(query).toHaveBeenLastCalledWith("rollback")
  })
})
