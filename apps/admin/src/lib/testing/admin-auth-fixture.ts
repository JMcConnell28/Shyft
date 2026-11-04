import { beforeEach, vi } from "vitest"
import { hashPassword } from "better-auth/crypto"

import { auth } from "@/lib/auth"

const { database, requireMembership, ensureMembership, revokeSessions } =
  vi.hoisted(() => {
    const rows: Record<string, Array<Record<string, unknown>>> = {}
    return {
      database: rows,
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
  getOptionalEnv: (name: string) =>
    name === "ADMIN_BETTER_AUTH_URL"
      ? "http://localhost:3001"
      : name === "ADMIN_BOOTSTRAP_EMAILS"
        ? "operator@example.test"
        : undefined,
}))
vi.mock("@/features/auth/server/admin-session", () => ({
  ensureAdminMembershipForUser: ensureMembership,
  requireAdminMembership: requireMembership,
  revokeAdminSessionsForUser: revokeSessions,
}))

const operator = {
  email: "operator@example.test",
  name: "Test operator",
  password: "test-operator-password-only",
}
let requestNumber = 0
function postAuth(path: string, body: Record<string, unknown>, cookie = "") {
  return auth.handler(
    new Request(`http://localhost:3001/api/auth${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3001",
        cookie,
        "x-forwarded-for": `198.51.100.${++requestNumber}`,
      },
      body: JSON.stringify(body),
    })
  )
}
function sessionCookie(response: Response): string {
  return response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ")
}
function getStoredUser(): Record<string, unknown> {
  const user = database.admin_user.find((row) => row.email === operator.email)
  if (!user) throw new Error("The fixture operator is missing.")
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
    "admin_two_factor",
  ])
    database[model] = []
  requireMembership.mockResolvedValue({ disabledAt: null })
  ensureMembership.mockResolvedValue({ disabledAt: null })
  revokeSessions.mockImplementation((userId: string) => {
    database.admin_session = database.admin_session.filter(
      (row) => row.userId !== userId
    )
    return Promise.resolve()
  })
  // Represents an operator-created credential account. Public signup stays shut.
  database.admin_user.push({
    id: "operator",
    email: operator.email,
    name: operator.name,
    emailVerified: true,
    role: "readonly",
    twoFactorEnabled: false,
    disabled_at: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  database.admin_account.push({
    id: "credential",
    accountId: "operator",
    userId: "operator",
    providerId: "credential",
    password: await hashPassword(operator.password),
    createdAt: new Date(),
    updatedAt: new Date(),
  })
})

export {
  database,
  operator,
  postAuth,
  getStoredUser,
  requireMembership,
  revokeSessions,
  sessionCookie,
}
