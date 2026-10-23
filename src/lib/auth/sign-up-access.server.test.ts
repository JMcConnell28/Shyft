import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { requireSignUpAccessCode } from "@/lib/auth/sign-up-access.server"

describe("sign-up access code", () => {
  beforeEach(() => vi.stubEnv("SIGNUP_ACCESS_CODE", "654321"))
  afterEach(() => vi.unstubAllEnvs())

  it("allows the configured code and rejects missing or incorrect codes", () => {
    expect(() => requireSignUpAccessCode("654321")).not.toThrow()
    expect(() => requireSignUpAccessCode(undefined)).toThrow(
      "The access code is incorrect."
    )
    expect(() => requireSignUpAccessCode("111111")).toThrow(
      "The access code is incorrect."
    )
  })

  it("uses an environment override when the code is rotated", () => {
    vi.stubEnv("SIGNUP_ACCESS_CODE", "123456")

    expect(() => requireSignUpAccessCode("654321")).toThrow()
    expect(() => requireSignUpAccessCode("123456")).not.toThrow()
  })

  it.each([undefined, "", "12345", "invalid"])(
    "fails closed when the configured secret is %s",
    (configuredCode) => {
      vi.stubEnv("SIGNUP_ACCESS_CODE", configuredCode)
      expect(() => requireSignUpAccessCode("522562")).toThrow(
        "Sign-up is temporarily unavailable. Please contact support."
      )
    }
  )

  it.each(["", "123", "1234567", null, 654321, "abcdef"])(
    "rejects malformed input %s without a timing comparison error",
    (input) => {
      expect(() => requireSignUpAccessCode(input)).toThrow(
        "The access code is incorrect."
      )
    }
  )
})
