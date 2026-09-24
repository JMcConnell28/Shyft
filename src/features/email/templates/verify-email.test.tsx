import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { VerifyEmail } from "@/features/email/templates/verify-email"

describe("VerifyEmail", () => {
  it("renders the verification design without the removed tagline", () => {
    const html = renderToStaticMarkup(
      <VerifyEmail
        brandWordmarkUrl="https://example.com/brand/rocketrota-wordmark.png"
        emailGraphicUrl="https://example.com/brand/email-verification.png"
        fontUrl="https://example.com/manrope.woff2"
        verificationUrl="https://example.com/verify"
      />
    )

    expect(html).toContain("Verify your email")
    expect(html).toContain("https://example.com/brand/rocketrota-wordmark.png")
    expect(html).toContain("https://example.com/brand/email-verification.png")
    expect(html).toContain("https://example.com/manrope.woff2")
    expect(html).toContain("font-family:Manrope")
    expect(html).toContain("https://example.com/verify")
    expect(html).not.toContain("cid:")
    expect(html).not.toContain("localhost")
    expect(html).not.toContain("People. Shifts. Simplified")
  })
})
