import { expect, it, vi } from "vitest"
import { generateClockStationTag } from "./actions"

const { query, audit } = vi.hoisted(() => ({ query: vi.fn(), audit: vi.fn() }))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@rocketrota/db", () => ({
  getDatabase: () => ({ query }),
  queryOne: () =>
    Promise.resolve({ id: "location", organization_id: "organization" }),
}))
vi.mock("@/features/audit/server/audit-log", () => ({
  writeAdminAuditLog: audit,
}))

it("returns NFC setup to the authorized caller without copying its AES key into audit logs", async () => {
  const tag = {
    id: "tag",
    location_id: "location",
    ntag_aes_key_hex: "private-setup-key",
    ntag_public_id: "public-id",
    ntag_last_seen_counter: 0,
  }
  query.mockResolvedValue({ rows: [tag] })
  expect(
    await generateClockStationTag({
      locationId: "location",
      adminUserId: "admin",
    })
  ).toEqual(tag)
  expect(audit).toHaveBeenCalledWith(
    expect.objectContaining({
      afterState: { id: "tag", locationId: "location", publicId: "public-id" },
    }),
    expect.objectContaining({ query })
  )
  expect(JSON.stringify(audit.mock.calls)).not.toContain("private-setup-key")
})
