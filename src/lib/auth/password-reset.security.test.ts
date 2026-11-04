import { betterAuth } from "better-auth"
import { describe, expect, it } from "vitest"
import { z } from "zod"

import {
  database,
  postAuth,
  sendReset,
  sessionCookie,
  userDetails,
} from "@/lib/auth/testing/main-auth-fixture"
import { auth } from "@/lib/auth"

const newPassword = "isolated-recovered-password-only"

async function requestResetToken(): Promise<string> {
  const response = await postAuth("/request-password-reset", {
    email: userDetails.email,
    redirectTo: "http://localhost:3000/reset-password",
  })
  expect(response.status).toBe(200)
  const email = z
    .object({ resetUrl: z.url() })
    .parse(sendReset.mock.lastCall?.[0])
  const callback = await auth.handler(new Request(email.resetUrl))
  expect(callback.status).toBe(302)
  const location = z.url().parse(callback.headers.get("location"))
  return z.string().min(1).parse(new URL(location).searchParams.get("token"))
}

function readSession(cookie: string) {
  // No cache-bypass query: the production default must enforce revocation.
  return auth.api.getSession({ headers: new Headers({ cookie }) })
}

describe("password recovery session revocation", () => {
  it("revokes every session immediately, including cookies issued by the old cache configuration", async () => {
    expect((await postAuth("/sign-up/email", userDetails)).status).toBe(200)
    const legacyAuth = betterAuth({
      ...auth.options,
      session: {
        cookieCache: { enabled: true, maxAge: 300, strategy: "compact" },
      },
    })
    const loginA = await postAuth("/sign-in/email", userDetails)
    const loginB = await postAuth(
      "/sign-in/email",
      userDetails,
      "",
      "654321",
      legacyAuth
    )
    expect(loginA.status).toBe(200)
    expect(loginB.status).toBe(200)
    const cookies = [sessionCookie(loginA), sessionCookie(loginB)]
    expect(cookies[1]).toContain("session_data=")
    for (const cookie of cookies)
      expect(await readSession(cookie)).not.toBeNull()
    expect(database.session.length).toBeGreaterThanOrEqual(2)

    const token = await requestResetToken()
    expect(
      (await postAuth("/reset-password", { token, newPassword: "short" }))
        .status
    ).toBe(400)
    for (const cookie of cookies)
      expect(await readSession(cookie)).not.toBeNull()
    expect(
      (await postAuth("/reset-password", { token, newPassword })).status
    ).toBe(200)
    expect(database.session).toHaveLength(0)
    for (const cookie of cookies) {
      expect(await readSession(cookie)).toBeNull()
      expect(
        (
          await postAuth(
            "/update-user",
            { image: "https://example.test/image.png" },
            cookie
          )
        ).status
      ).toBe(401)
    }
    expect((await postAuth("/sign-in/email", userDetails)).status).toBe(401)
    const newLogin = await postAuth("/sign-in/email", {
      ...userDetails,
      password: newPassword,
    })
    expect(newLogin.status).toBe(200)
    expect(await readSession(sessionCookie(newLogin))).not.toBeNull()
    expect(
      (
        await postAuth("/reset-password", {
          token,
          newPassword: "another-unused-password",
        })
      ).status
    ).toBe(400)
    expect(await readSession(sessionCookie(newLogin))).not.toBeNull()
  }, 30_000)

  it.each(["unknown", "expired"])(
    "rejects an %s reset link without revoking valid sessions",
    async (kind) => {
      const signup = await postAuth("/sign-up/email", userDetails)
      expect(signup.status).toBe(200)
      const cookie = sessionCookie(signup)
      const token =
        kind === "unknown"
          ? "nonexistent-reset-token"
          : await requestResetToken()
      if (kind === "expired") {
        const verification = database.verification.find(
          (row) => row.identifier === `reset-password:${token}`
        )
        if (!verification)
          throw new Error("The fixture reset token is missing.")
        verification.expiresAt = new Date(0)
      }
      expect(
        (await postAuth("/reset-password", { token, newPassword })).status
      ).toBe(400)
      expect(await readSession(cookie)).not.toBeNull()
      expect((await postAuth("/sign-in/email", userDetails)).status).toBe(200)
    },
    30_000
  )

  it("keeps password changes limited to revoking other sessions", async () => {
    const signup = await postAuth("/sign-up/email", userDetails)
    const login = await postAuth("/sign-in/email", userDetails)
    expect(signup.status).toBe(200)
    expect(login.status).toBe(200)
    const response = await postAuth(
      "/change-password",
      {
        currentPassword: userDetails.password,
        newPassword,
        revokeOtherSessions: true,
      },
      sessionCookie(login)
    )
    expect(response.status).toBe(200)
    const currentCookie = sessionCookie(response)
    expect(await readSession(currentCookie)).not.toBeNull()
    expect(await readSession(sessionCookie(signup))).toBeNull()
    expect(await readSession(sessionCookie(login))).toBeNull()
    expect(database.session).toHaveLength(1)
  }, 30_000)
})
