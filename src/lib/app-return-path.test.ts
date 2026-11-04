import { describe, expect, it } from "vitest"

import { getSafeAppReturnPath, isSafeAppReturnPath } from "./app-return-path"
import {
  authenticationSearchSchema,
  verificationSearchSchema,
} from "@/features/account/schemas/authentication-search-schemas"

describe("authentication return paths", () => {
  it.each([
    "https://evil.example",
    "//evil.example",
    "\\evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
    "data:text/html,hello",
    " //evil.example",
    "/\t/evil.example",
    "/%2fevil.example",
    "/%252fevil.example",
    "/%5cevil.example",
    "/%255cevil.example",
    "/%0a/evil.example",
    "/%2e%2e//evil.example",
    "/../ /evil.example",
    "/bad%zz",
    "",
  ])("falls back for %j across login, signup and verification", (redirect) => {
    expect(isSafeAppReturnPath(redirect)).toBe(false)
    expect(authenticationSearchSchema.parse({ redirect }).redirect).toBe(
      "/dashboard"
    )
    expect(verificationSearchSchema.parse({ redirect }).redirect).toBe(
      "/dashboard"
    )
    expect(getSafeAppReturnPath(redirect, "/dashboard")).toBe("/dashboard")
  })
  it.each([
    "/dashboard",
    "/app/team/calendar?date=2026-11-02#today",
    "/accept-invitation/abc?label=Team%20One",
    "/app/team?return=%2Fdashboard",
    "/app/team?value=50%25",
  ])("preserves internal destination %s", (redirect) => {
    expect(authenticationSearchSchema.parse({ redirect }).redirect).toBe(
      redirect
    )
    expect(new URL(redirect, "https://app.example").origin).toBe(
      "https://app.example"
    )
  })
  it("defaults non-string input and rejects an unsafe developer fallback", () => {
    expect(
      authenticationSearchSchema.parse({ redirect: ["//evil.example"] })
        .redirect
    ).toBe("/dashboard")
    expect(authenticationSearchSchema.parse({}).redirect).toBe("/dashboard")
    expect(() => getSafeAppReturnPath(null, "https://evil.example")).toThrow(
      "internal"
    )
  })
})
