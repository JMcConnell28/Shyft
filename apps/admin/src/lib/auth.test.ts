import { beforeEach, describe, expect, it } from "vitest"
import { APIError } from "better-auth/api"
import {
  getStoredUser,
  operator,
  postAuth,
  requireMembership,
  revokeSessions,
  sessionCookie,
} from "@/lib/testing/admin-auth-fixture"
import { auth } from "@/lib/auth"

let cookie = ""
beforeEach(async () => {
  const response = await postAuth("/sign-in/email", operator)
  expect(response.status).toBe(200)
  cookie = sessionCookie(response)
})

describe("admin authentication boundaries", () => {
  it.each([
    { role: "owner" },
    { role: "developer" },
    { role: null },
    { role: false },
    { disabledAt: null },
    { disabledAt: false },
    { disabledAt: "2026-10-18T12:00:00Z" },
    { disabled_at: null },
    { twoFactorEnabled: true },
    { two_factor_enabled: true },
  ])(
    "rejects protected profile fields %j without applying other changes",
    async (fields) => {
      const user = getStoredUser()
      const disabledAt = user.disabled_at
      const response = await postAuth(
        "/update-user",
        { name: "Changed operator", ...fields },
        cookie
      )
      expect(response.status).toBe(403)
      expect(getStoredUser()).toMatchObject({
        role: "readonly",
        name: "Test operator",
      })
      expect(getStoredUser().disabled_at).toBe(disabledAt)
      expect(revokeSessions).not.toHaveBeenCalled()
    }
  )

  it("allows ordinary profile changes without changing permissions", async () => {
    const response = await postAuth(
      "/update-user",
      { name: "Updated operator" },
      cookie
    )
    expect(response.status).toBe(200)
    expect(getStoredUser()).toMatchObject({
      role: "readonly",
      name: "Updated operator",
    })
    expect(revokeSessions).not.toHaveBeenCalled()
  })

  it("rejects sign-in when the active-membership check rejects the account", async () => {
    requireMembership.mockRejectedValueOnce(
      new APIError("FORBIDDEN", {
        message: "This admin account has been disabled.",
      })
    )
    const response = await postAuth("/sign-in/email", {
      email: "operator@example.test",
      password: "test-operator-password-only",
    })
    expect(response.status).toBe(403)
    expect(requireMembership).toHaveBeenCalledWith(getStoredUser().id)
  })

  it("revokes sessions when a trusted backend update disables the account", async () => {
    const context = await auth.$context
    await context.internalAdapter.updateUser(String(getStoredUser().id), {
      disabledAt: new Date(),
    })
    expect(revokeSessions).toHaveBeenCalledWith(getStoredUser().id)
  })
})
