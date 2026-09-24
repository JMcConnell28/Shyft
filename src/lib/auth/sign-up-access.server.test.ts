import { afterEach, describe, expect, it, vi } from "vitest"

import { requireSignUpAccessCode } from "@/lib/auth/sign-up-access.server"

describe("sign-up access code", () => {
  afterEach(() => vi.unstubAllEnvs())

  it("allows the configured code and rejects missing or incorrect codes", () => {
    expect(() => requireSignUpAccessCode("522562")).not.toThrow()
    expect(() => requireSignUpAccessCode(undefined)).toThrow(
      "The access code is incorrect."
    )
    expect(() => requireSignUpAccessCode("111111")).toThrow(
      "The access code is incorrect."
    )
  })

  it("uses an environment override when the code is rotated", () => {
    vi.stubEnv("SIGNUP_ACCESS_CODE", "123456")

    expect(() => requireSignUpAccessCode("522562")).toThrow()
    expect(() => requireSignUpAccessCode("123456")).not.toThrow()
  })
})
