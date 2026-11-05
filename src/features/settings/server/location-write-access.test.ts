import { beforeEach, describe, expect, it, vi } from "vitest"
import { requireSettingsLocationWriteAccess } from "./location-write-access"

const { billing, org, location } = vi.hoisted(() => ({
  billing: vi.fn(),
  org: vi.fn(),
  location: vi.fn(),
}))
vi.mock("@/features/billing/server/workspace-write-access", () => ({
  requireWorkspaceWriteAccess: billing,
}))
vi.mock("@/lib/auth/has-org-permission", () => ({ requireOrgPermission: org }))
vi.mock("@/lib/auth/has-location-permission", () => ({
  requireLocationPermission: location,
}))
beforeEach(() => vi.resetAllMocks())

describe("settings write access", () => {
  it("starts independent billing and permission checks together but waits for both", async () => {
    let finish = () => {}
    billing.mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve
      })
    )
    let allowed = false
    const access = requireSettingsLocationWriteAccess(
      { organizationId: "org", userId: "user" },
      "create"
    ).then(() => {
      allowed = true
    })
    expect(billing).toHaveBeenCalledOnce()
    expect(org).toHaveBeenCalledOnce()
    await Promise.resolve()
    expect(allowed).toBe(false)
    finish()
    await access
    expect(allowed).toBe(true)
  })
  it.each(["billing", "permission"])(
    "preserves rejection from %s checks",
    async (failure) => {
      ;(failure === "billing" ? billing : org).mockRejectedValue(
        new Error("Denied")
      )
      await expect(
        requireSettingsLocationWriteAccess(
          { organizationId: "org", userId: "user" },
          "create"
        )
      ).rejects.toThrow("Denied")
    }
  )
  it("uses location-scoped permissions for location workspaces", async () => {
    await requireSettingsLocationWriteAccess(
      { locationId: "location", userId: "user" },
      "update"
    )
    expect(location).toHaveBeenCalledWith(
      expect.objectContaining({
        locationId: "location",
        permissions: { location: ["update"] },
      })
    )
    expect(org).not.toHaveBeenCalled()
  })
})
