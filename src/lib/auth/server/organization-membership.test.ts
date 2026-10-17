import { beforeEach, describe, expect, it, vi } from "vitest"
import { readOrganizationMembershipRole } from "./organization-membership"

const query = vi.hoisted(() => vi.fn())
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))
vi.mock("@/lib/server-timing", () => ({
  timeServerOperation: (_name: string, operation: () => Promise<unknown>) =>
    operation(),
}))
beforeEach(() => {
  vi.resetAllMocks()
})

describe("fresh organization membership reads", () => {
  it("scopes each authorization lookup by both tenant and user without caching", async () => {
    query
      .mockResolvedValueOnce({ rows: [{ role: "manager" }] })
      .mockResolvedValueOnce({ rows: [] })
    expect(await readOrganizationMembershipRole("org-a", "user-a")).toBe(
      "manager"
    )
    expect(await readOrganizationMembershipRole("org-a", "user-a")).toBeNull()
    expect(query).toHaveBeenCalledTimes(2)
    expect(query.mock.calls[0]?.[1]).toEqual(["org-a", "user-a"])
  })
  it.each(["__proto__", "unknown", null, 123])(
    "denies unknown database roles: %s",
    async (role) => {
      query.mockResolvedValue({ rows: [{ role }] })
      expect(await readOrganizationMembershipRole("org-a", "user-b")).toBeNull()
    }
  )
  it("fails closed on ambiguous membership or a failed database read", async () => {
    query
      .mockResolvedValueOnce({
        rows: [{ role: "owner" }, { role: "employee" }],
      })
      .mockRejectedValueOnce(new Error("Unavailable"))
    await expect(
      readOrganizationMembershipRole("org", "user")
    ).rejects.toThrow()
    await expect(readOrganizationMembershipRole("org", "user")).rejects.toThrow(
      "Unavailable"
    )
  })
})
