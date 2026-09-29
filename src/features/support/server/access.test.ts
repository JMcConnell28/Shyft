import { beforeEach, describe, expect, it, vi } from "vitest"

import { requireCustomerSupportAccess } from "@/features/support/server/access"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"

const { query } = vi.hoisted(() => ({ query: vi.fn() }))

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))
vi.mock("@/features/onboarding/server/session", () => ({
  requireVerifiedSessionOrThrow: vi.fn(),
}))

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(requireVerifiedSessionOrThrow).mockResolvedValue({
    headers: new Headers(),
    session: { user: { id: "user-1" } },
  } as Awaited<ReturnType<typeof requireVerifiedSessionOrThrow>>)
})

describe("customer support access", () => {
  it.each(["owner", "admin", "manager"])("allows %s", async (role) => {
    query.mockResolvedValue({ rows: [{ role }] })
    await expect(requireCustomerSupportAccess("org-1")).resolves.toEqual({
      organizationId: "org-1",
      userId: "user-1",
    })
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("public.member"),
      ["org-1", "user-1"]
    )
  })

  it.each(["supervisor", "employee", null])("rejects %s", async (role) => {
    query.mockResolvedValue({ rows: role ? [{ role }] : [] })
    await expect(requireCustomerSupportAccess("org-1")).rejects.toThrow(
      "You do not have access to workplace support."
    )
  })

  it("rejects a request without a verified session before querying membership", async () => {
    vi.mocked(requireVerifiedSessionOrThrow).mockRejectedValue(
      new Error("Sign in")
    )
    await expect(requireCustomerSupportAccess("org-1")).rejects.toThrow(
      "Sign in"
    )
    expect(query).not.toHaveBeenCalled()
  })
})
