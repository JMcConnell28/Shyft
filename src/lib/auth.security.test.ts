import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { termsVersion } from "@/features/legal/terms"
import { auth } from "@/lib/auth"

const { database, sendVerification } = vi.hoisted(() => {
  const testDatabase: Record<string, Array<Record<string, unknown>>> = {}
  return { database: testDatabase, sendVerification: vi.fn() }
})

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", async () => {
  const { memoryAdapter } = await import("better-auth/adapters/memory")
  return { getDatabase: () => memoryAdapter(database) }
})
vi.mock("@/lib/env.server", () => ({
  getRequiredEnv: () => "main-auth-tests-only-secret-at-least-32-characters",
  getOptionalEnv: (name: string) =>
    name === "BETTER_AUTH_URL"
      ? "http://localhost:3000"
      : name === "SIGNUP_ACCESS_CODE"
        ? process.env.SIGNUP_ACCESS_CODE
        : undefined,
}))
vi.mock("@/lib/email-verification", () => ({
  isDevelopmentEmailVerificationBypassed: () => false,
}))
vi.mock("@/features/email/server/auth-emails", () => ({
  sendVerificationEmail: sendVerification,
  sendPasswordResetEmail: vi.fn(),
  sendOrganizationInvitationEmail: vi.fn(),
}))

const userDetails = {
  name: "Test employee",
  email: "employee@example.test",
  password: "isolated-auth-regression-password",
  dateOfBirth: "1995-01-01",
}

function postAuth(
  path: string,
  body: Record<string, unknown>,
  cookie = "",
  code = "654321"
) {
  return auth.handler(
    new Request(`http://localhost:3000/api/auth${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
        "x-signup-access-code": code,
        "x-terms-version": termsVersion,
        cookie,
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

describe("main authentication security boundaries", () => {
  it("blocks signup before creating a user when beta configuration is missing", async () => {
    vi.stubEnv("SIGNUP_ACCESS_CODE", undefined)
    const response = await postAuth("/sign-up/email", userDetails)
    expect(response.status).toBe(503)
    expect(database.user).toHaveLength(0)
    expect(sendVerification).not.toHaveBeenCalled()
  })

  it("rejects the old source fallback and accepts only the configured code", async () => {
    expect(
      (await postAuth("/sign-up/email", userDetails, "", "522562")).status
    ).toBe(403)
    expect(database.user).toHaveLength(0)
    expect((await postAuth("/sign-up/email", userDetails)).status).toBe(200)
    expect(database.user).toHaveLength(1)
    expect(sendVerification).toHaveBeenCalledOnce()
  })

  it("supports password sign-in and revokes the token on sign-out", async () => {
    expect((await postAuth("/sign-up/email", userDetails)).status).toBe(200)
    const login = await postAuth("/sign-in/email", userDetails)
    expect(login.status).toBe(200)
    const cookie = sessionCookie(login)
    const readSession = () =>
      auth.api.getSession({
        headers: new Headers({ cookie }),
        query: { disableCookieCache: true },
      })
    expect(await readSession()).not.toBeNull()
    expect((await postAuth("/sign-out", {}, cookie)).status).toBe(200)
    expect(await readSession()).toBeNull()
  }, 30_000)
})
