import { betterAuth } from "better-auth"
import { describe, expect, it, vi } from "vitest"
import type * as startServer from "@tanstack/react-start/server"

import {
  consumeLimit,
  limits,
  postAuth,
  sendReset,
  userDetails,
} from "@/lib/auth/testing/main-auth-fixture"
import { auth } from "@/lib/auth"
import {
  requestPasswordReset,
  resetPassword,
} from "@/features/account/server/actions"
import { requestPasswordResetSchema } from "@/features/account/schemas/account-schemas"

const { getRequest } = vi.hoisted(() => ({ getRequest: vi.fn() }))
vi.mock("@tanstack/react-start/server", async (importOriginal) => ({
  ...(await importOriginal<typeof startServer>()),
  getRequest,
}))
vi.mock("@/lib/auth-server", () => ({ ensureSession: vi.fn() }))

function wrapperRequest(ip = "192.0.2.10", origin = "http://localhost:3000") {
  const request = new Request("http://localhost:3000/_serverFn/test-recovery", {
    method: "POST",
    headers: { origin },
  })
  Object.assign(request, { ip })
  getRequest.mockReturnValue(request)
  return request
}

describe("shared recovery abuse controls", () => {
  it("returns identical wrapper success for known and unknown accounts", async () => {
    expect((await postAuth("/sign-up/email", userDetails)).status).toBe(200)
    wrapperRequest()
    const known = await requestPasswordReset({ email: userDetails.email })
    const unknown = await requestPasswordReset({
      email: "unknown@example.test",
    })
    expect(known).toEqual({ success: true })
    expect(unknown).toEqual(known)
    expect(sendReset).toHaveBeenCalledTimes(1)
    const email = sendReset.mock.lastCall?.[0]
    expect(new URL(email.resetUrl).searchParams.get("callbackURL")).toBe(
      "http://localhost:3000/reset-password"
    )
  })

  it("shares email limits between wrappers, raw routes and a second auth instance", async () => {
    expect((await postAuth("/sign-up/email", userDetails)).status).toBe(200)
    wrapperRequest()
    await requestPasswordReset({ email: userDetails.email })
    expect(
      (await postAuth("/request-password-reset", { email: userDetails.email }))
        .status
    ).toBe(200)
    const secondWorker = betterAuth({ ...auth.options })
    expect(
      (
        await postAuth(
          "/request-password-reset",
          { email: userDetails.email.toUpperCase() },
          "",
          "654321",
          secondWorker
        )
      ).status
    ).toBe(200)
    wrapperRequest("192.0.2.99")
    await expect(
      requestPasswordReset({ email: userDetails.email })
    ).rejects.toMatchObject({ statusCode: 429 })
    const denied = await postAuth("/request-password-reset", {
      email: userDetails.email,
    })
    expect(denied.status).toBe(429)
    expect(denied.headers.get("retry-after")).toBe("900")
    expect(sendReset).toHaveBeenCalledTimes(3)
    expect([...limits.keys()].every((key) => /^[0-9a-f]{64}$/.test(key))).toBe(
      true
    )
  })

  it("limits one source across changing email addresses and spoofed headers", async () => {
    for (let index = 0; index < 20; index++) {
      const request = wrapperRequest()
      request.headers.set("x-forwarded-for", `198.51.100.${index}`)
      await requestPasswordReset({ email: `unknown-${index}@example.test` })
    }
    wrapperRequest()
    await expect(
      requestPasswordReset({ email: "next@example.test" })
    ).rejects.toMatchObject({ statusCode: 429 })
    wrapperRequest("192.0.2.11")
    await expect(
      requestPasswordReset({ email: "next@example.test" })
    ).resolves.toEqual({ success: true })
    expect(sendReset).not.toHaveBeenCalled()
  })

  it("bounds token guesses across routes and wrappers", async () => {
    const body = {
      token: "not-a-real-token",
      newPassword: "long-recovery-fixture-password",
    }
    for (let index = 0; index < 10; index++) {
      wrapperRequest(`192.0.2.${index}`)
      await expect(
        resetPassword({ ...body, confirmPassword: body.newPassword })
      ).rejects.toMatchObject({ statusCode: 400 })
    }
    expect((await postAuth("/reset-password", body)).status).toBe(429)
  })

  it("completes a legitimate recovery through the wrapper", async () => {
    expect((await postAuth("/sign-up/email", userDetails)).status).toBe(200)
    wrapperRequest()
    await requestPasswordReset({ email: userDetails.email })
    const callback = await auth.handler(
      new Request(sendReset.mock.lastCall?.[0].resetUrl)
    )
    const location = callback.headers.get("location")
    if (!location) throw new Error("Fixture recovery callback is missing.")
    const token = new URL(location).searchParams.get("token")
    if (!token) throw new Error("Fixture recovery token is missing.")
    const newPassword = "valid-new-wrapper-password"
    wrapperRequest()
    await expect(
      resetPassword({ token, newPassword, confirmPassword: newPassword })
    ).resolves.toEqual({ success: true })
    expect(
      (
        await postAuth("/sign-in/email", {
          ...userDetails,
          password: newPassword,
        })
      ).status
    ).toBe(200)
  })

  it("enforces a shared fallback budget when trustworthy source metadata is absent", async () => {
    for (let index = 0; index < 100; index++) {
      const request = wrapperRequest()
      Reflect.deleteProperty(request, "ip")
      request.headers.set("x-forwarded-for", `198.51.100.${index}`)
      await requestPasswordReset({ email: `fallback-${index}@example.test` })
    }
    const request = wrapperRequest()
    Reflect.deleteProperty(request, "ip")
    await expect(
      requestPasswordReset({ email: "over-fallback@example.test" })
    ).rejects.toMatchObject({ statusCode: 429 })
  })

  it("rejects arbitrary callback destinations and untrusted origins before sending mail", async () => {
    expect((await postAuth("/sign-up/email", userDetails)).status).toBe(200)
    for (const redirectTo of [
      "https://attacker.example/reset-password",
      "//attacker.example",
      "/other-page",
      "http://localhost:3000/reset-password?next=external",
    ]) {
      expect(
        (
          await postAuth("/request-password-reset", {
            email: userDetails.email,
            redirectTo,
          })
        ).status
      ).toBe(400)
      expect(
        requestPasswordResetSchema.safeParse({
          email: userDetails.email,
          redirectTo,
        }).success
      ).toBe(false)
    }
    wrapperRequest("192.0.2.10", "https://attacker.example")
    await expect(
      requestPasswordReset({ email: userDetails.email })
    ).rejects.toMatchObject({ statusCode: 403 })
    expect(sendReset).not.toHaveBeenCalled()
  })

  it("requires request context even for direct API calls", async () => {
    await expect(
      auth.api.requestPasswordReset({ body: { email: userDetails.email } })
    ).rejects.toMatchObject({ statusCode: 400 })
    expect(consumeLimit).not.toHaveBeenCalled()
  })

  it("fails closed without leaking database errors", async () => {
    consumeLimit.mockRejectedValueOnce(new Error("private database details"))
    wrapperRequest()
    await expect(
      requestPasswordReset({ email: userDetails.email })
    ).rejects.toMatchObject({
      statusCode: 503,
      message:
        "Password recovery is temporarily unavailable. Please try again later.",
    })
    expect(sendReset).not.toHaveBeenCalled()
  })

  it("stops before allocating identity keys when the global budget is exhausted", async () => {
    consumeLimit.mockResolvedValueOnce({ allowed: false, retryAfter: 300 })
    wrapperRequest()
    await expect(
      requestPasswordReset({ email: userDetails.email })
    ).rejects.toMatchObject({ statusCode: 429 })
    expect(consumeLimit).toHaveBeenCalledTimes(1)
  })
})
