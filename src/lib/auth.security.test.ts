import { describe, expect, it, vi } from "vitest"

import {
  database,
  postAuth,
  sendVerification,
  sessionCookie,
  userDetails,
} from "@/lib/auth/testing/main-auth-fixture"
import { auth } from "@/lib/auth"

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
      auth.api.getSession({ headers: new Headers({ cookie }) })
    expect(await readSession()).not.toBeNull()
    expect((await postAuth("/sign-out", {}, cookie)).status).toBe(200)
    expect(await readSession()).toBeNull()
  }, 30_000)
})
