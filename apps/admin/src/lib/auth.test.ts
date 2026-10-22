import { beforeEach, describe, expect, it, vi } from "vitest"
import { APIError } from "better-auth/api"

import { auth } from "@/lib/auth"

const { database, requireMembership, ensureMembership, revokeSessions } =
  vi.hoisted(() => {
    const testDatabase: Record<string, Array<Record<string, unknown>>> = {}
    return {
      database: testDatabase,
      requireMembership: vi.fn(),
      ensureMembership: vi.fn(),
      revokeSessions: vi.fn(),
    }
  })

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/admin-auth-database", async () => {
  const { memoryAdapter } = await import("better-auth/adapters/memory")
  return { getAdminAuthDatabase: () => memoryAdapter(database) }
})
vi.mock("@/lib/env.server", () => ({
  getRequiredEnv: () => "admin-auth-regression-tests-only-secret-32-characters",
  getOptionalEnv: (name: string) => {
    if (name === "ADMIN_BETTER_AUTH_URL") return "http://localhost:3001"
    if (name === "ADMIN_BOOTSTRAP_EMAILS") return "operator@example.test"
    return undefined
  },
}))
vi.mock("@/features/auth/server/admin-session", () => ({
  ensureAdminMembershipForUser: ensureMembership,
  requireAdminMembership: requireMembership,
  revokeAdminSessionsForUser: revokeSessions,
}))

let cookie = ""

function postAuth(
  path: string,
  body: Record<string, unknown>,
  sessionCookie = ""
) {
  return auth.handler(
    new Request(`http://localhost:3001/api/auth${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3001",
        cookie: sessionCookie,
      },
      body: JSON.stringify(body),
    })
  )
}

function getStoredUser(): Record<string, unknown> {
  const user = Object.values(database)
    .flat()
    .find((row) => row.email === "operator@example.test")
  if (!user) throw new Error("Test operator was not created.")
  return user
}

beforeEach(async () => {
  vi.resetAllMocks()
  for (const key of Object.keys(database)) delete database[key]
  for (const model of [
    "admin_user",
    "admin_session",
    "admin_account",
    "admin_verification",
  ]) {
    database[model] = []
  }
  ensureMembership.mockResolvedValue({ disabledAt: null })
  requireMembership.mockResolvedValue({ disabledAt: null })
  revokeSessions.mockResolvedValue(undefined)

  const response = await postAuth("/sign-up/email", {
    email: "operator@example.test",
    name: "Test operator",
    password: "test-operator-password-only",
  })
  expect(response.status).toBe(200)
  cookie = response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ")
  expect(cookie).toContain("rocketrota-admin")
  // Provision a readonly operator before exercising the public profile endpoint.
  expect(getStoredUser().role).toBe("owner")
  getStoredUser().role = "readonly"
  vi.clearAllMocks()
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
