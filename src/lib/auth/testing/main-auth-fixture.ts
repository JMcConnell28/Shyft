import { afterEach, beforeEach, vi } from "vitest"

import { termsVersion } from "@/features/legal/terms"
import { auth } from "@/lib/auth"

const { database, sendReset, sendVerification, consumeLimit, limits } =
  vi.hoisted(() => {
    const testDatabase: Record<string, Array<Record<string, unknown>>> = {}
    return {
      database: testDatabase,
      sendReset: vi.fn(),
      sendVerification: vi.fn(),
      consumeLimit: vi.fn(),
      limits: new Map<string, number>(),
    }
  })

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/features/account/server/recovery-limit-store", () => ({
  consumeRecoveryLimit: consumeLimit,
}))
vi.mock("@/lib/db", async () => {
  const { memoryAdapter } = await import("better-auth/adapters/memory")
  return { getDatabase: () => memoryAdapter(database) }
})
vi.mock("@/lib/env.server", () => ({
  getRequiredEnv: () => "main-auth-tests-only-secret-at-least-32-characters",
  getOptionalEnv: (name: string) =>
    name === "BETTER_AUTH_URL"
      ? "http://localhost:3000"
      : name === "SIGNUP_ACCESS_CODE" ||
          name === "AUTH_RECOVERY_TRUSTED_IP_HEADER"
        ? process.env[name]
        : undefined,
}))
vi.mock("@/lib/email-verification", () => ({
  isDevelopmentEmailVerificationBypassed: () => false,
}))
vi.mock("@/features/email/server/auth-emails", () => ({
  sendVerificationEmail: sendVerification,
  sendPasswordResetEmail: sendReset,
  sendOrganizationInvitationEmail: vi.fn(),
}))

const userDetails = {
  name: "Test employee",
  email: "employee@example.test",
  password: "isolated-auth-regression-password",
  dateOfBirth: "1995-01-01",
}

let requestNumber = 0

function postAuth(
  path: string,
  body: Record<string, unknown>,
  cookie = "",
  code = "654321",
  issuer: Pick<typeof auth, "handler"> = auth
) {
  return issuer.handler(
    new Request(`http://localhost:3000/api/auth${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
        "x-signup-access-code": code,
        "x-terms-version": termsVersion,
        cookie,
        // Keep auth-flow tests independent of the shared per-IP limiter buckets.
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

beforeEach(() => {
  vi.clearAllMocks()
  limits.clear()
  consumeLimit.mockImplementation((key: string, max: number) => {
    const hits = (limits.get(key) ?? 0) + 1
    limits.set(key, hits)
    return Promise.resolve({ allowed: hits <= max, retryAfter: 900 })
  })
  vi.stubEnv("SIGNUP_ACCESS_CODE", "654321")
  for (const key of Object.keys(database)) delete database[key]
  for (const model of [
    "user",
    "session",
    "account",
    "verification",
    "passkey",
    "organization",
    "member",
    "invitation",
  ]) {
    database[model] = []
  }
})
afterEach(() => vi.unstubAllEnvs())

export {
  database,
  consumeLimit,
  limits,
  postAuth,
  sendReset,
  sendVerification,
  sessionCookie,
  userDetails,
}
