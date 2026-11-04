import { createOTP } from "@better-auth/utils/otp"
import { base32 } from "@better-auth/utils/base32"
import { describe, expect, it } from "vitest"
import { z } from "zod"

import {
  database,
  getStoredUser,
  operator,
  postAuth,
  revokeSessions,
  sessionCookie,
} from "@/lib/testing/admin-auth-fixture"
import { auth } from "@/lib/auth"

const setupSchema = z.object({
  totpURI: z.string(),
  backupCodes: z.array(z.string()),
})
async function enroll() {
  const login = await postAuth("/sign-in/email", operator)
  const cookie = sessionCookie(login)
  const setup = await postAuth(
    "/two-factor/enable",
    { password: operator.password, method: "totp" },
    cookie
  )
  expect(setup.status).toBe(200)
  const data = setupSchema.parse(await setup.json())
  const secret = new URL(data.totpURI).searchParams.get("secret")
  if (!secret) throw new Error("Fixture TOTP secret is missing.")
  return {
    ...data,
    cookie,
    otp: createOTP(new TextDecoder().decode(base32.decode(secret))),
  }
}
const readSession = (cookie: string) =>
  auth.api.getSession({ headers: new Headers({ cookie }) })

describe("operator provisioning and required admin MFA", () => {
  it("refuses public signup for both formerly allowlisted and unrelated addresses", async () => {
    database.admin_user = []
    database.admin_account = []
    for (const email of [operator.email, "outsider@example.test"]) {
      expect(
        (
          await postAuth("/sign-up/email", {
            ...operator,
            email,
            role: "owner",
          })
        ).status
      ).toBe(400)
    }
    expect(database.admin_user).toHaveLength(0)
    const context = await auth.$context
    await expect(
      context.internalAdapter.createUser(
        {
          email: operator.email,
          name: operator.name,
        },
        { method: "email-password" }
      )
    ).rejects.toThrow("authorized operator")
  })
  it(
    "verifies enrollment before enabling MFA and retires all password-only sessions",
    { timeout: 30_000 },
    async () => {
      const old = await postAuth("/sign-in/email", operator)
      const setup = await enroll()
      expect(getStoredUser().twoFactorEnabled).toBe(false)
      expect(
        (
          await postAuth(
            "/two-factor/verify-totp",
            { code: "invalid" },
            setup.cookie
          )
        ).status
      ).toBe(401)
      const verified = await postAuth(
        "/two-factor/verify-totp",
        { code: await setup.otp.totp() },
        setup.cookie
      )
      expect(verified.status).toBe(200)
      expect(getStoredUser().twoFactorEnabled).toBe(true)
      expect(revokeSessions).toHaveBeenCalledWith("operator")
      expect(await readSession(sessionCookie(old))).toBeNull()
      expect(await readSession(setup.cookie)).toBeNull()
      expect(await readSession(sessionCookie(verified))).not.toBeNull()
    }
  )
  it("issues no authenticated session until a correct second factor is provided", async () => {
    const setup = await enroll()
    await postAuth(
      "/two-factor/verify-totp",
      { code: await setup.otp.totp() },
      setup.cookie
    )
    const login = await postAuth("/sign-in/email", operator)
    expect(await login.json()).toMatchObject({ twoFactorRedirect: true })
    const challenge = sessionCookie(login)
    expect(await readSession(challenge)).toBeNull()
    const invalid = await postAuth(
      "/two-factor/verify-totp",
      { code: "invalid" },
      challenge
    )
    expect(invalid.status).toBe(401)
    expect(await readSession(sessionCookie(invalid))).toBeNull()
    const verified = await postAuth(
      "/two-factor/verify-totp",
      { code: await setup.otp.totp(), trustDevice: false },
      challenge
    )
    expect(verified.status).toBe(200)
    expect(await readSession(sessionCookie(verified))).not.toBeNull()
    expect(
      (
        await postAuth(
          "/two-factor/verify-totp",
          { code: await setup.otp.totp() },
          challenge
        )
      ).status
    ).toBe(401)
  })
  it("supports single-use recovery codes and rejects remembered-device and disable bypasses", async () => {
    const setup = await enroll()
    const verified = await postAuth(
      "/two-factor/verify-totp",
      { code: await setup.otp.totp() },
      setup.cookie
    )
    expect(
      (
        await postAuth(
          "/two-factor/disable",
          { password: operator.password },
          sessionCookie(verified)
        )
      ).status
    ).toBe(403)
    const challenge = sessionCookie(await postAuth("/sign-in/email", operator))
    expect(
      (
        await postAuth(
          "/two-factor/verify-backup-code",
          { code: setup.backupCodes[0], trustDevice: true },
          challenge
        )
      ).status
    ).toBe(403)
    const recovered = await postAuth(
      "/two-factor/verify-backup-code",
      { code: setup.backupCodes[0], trustDevice: false },
      challenge
    )
    expect(recovered.status).toBe(200)
    const nextChallenge = sessionCookie(
      await postAuth("/sign-in/email", operator)
    )
    expect(
      (
        await postAuth(
          "/two-factor/verify-backup-code",
          { code: setup.backupCodes[0] },
          nextChallenge
        )
      ).status
    ).toBe(401)
  })
})
