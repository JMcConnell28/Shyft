import { describe, expect, it } from "vitest"

import { buildVerificationEmailImageUrls } from "@/features/email/server/email-assets"

describe("verification email image URLs", () => {
  it("uses a public HTTPS origin for both images", () => {
    expect(buildVerificationEmailImageUrls("https://example.com")).toEqual({
      graphic: "https://example.com/brand/email-verification.png",
      wordmark: "https://example.com/brand/rocketrota-wordmark.png",
    })
  })

  it("rejects local and non-origin asset bases", () => {
    expect(() =>
      buildVerificationEmailImageUrls("http://localhost:3000")
    ).toThrow("EMAIL_ASSET_BASE_URL must be a public HTTPS origin")
    expect(() =>
      buildVerificationEmailImageUrls("https://localhost:3000")
    ).toThrow("EMAIL_ASSET_BASE_URL must be a public HTTPS origin")
    expect(() =>
      buildVerificationEmailImageUrls("https://example.com/app")
    ).toThrow("EMAIL_ASSET_BASE_URL must be a public HTTPS origin")
  })
})
