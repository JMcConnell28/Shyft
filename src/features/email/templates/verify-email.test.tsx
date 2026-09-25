import { render } from "@react-email/components"
import { describe, expect, it } from "vitest"

import { VerifyEmail } from "@/features/email/templates/verify-email"

describe("VerifyEmail", () => {
  it("keeps the complete message below Gmail's clipping threshold", async () => {
    const html = await render(
      <VerifyEmail
        brandLogoUrl="https://example.com/pwa/icon-192.png"
        emailGraphicUrl="https://example.com/brand/email-verification.png"
        verificationUrl="https://example.com/verify"
      />
    )

    expect(html).toContain("Verify your email")
    expect(html).toContain("https://example.com/pwa/icon-192.png")
    expect(html).toContain("https://example.com/brand/email-verification.png")
    expect(html).toContain("https://example.com/verify")
    expect(html).toContain("Rocket")
    expect(html).toContain("Rota")
    expect(html).toContain('width="128"')
    expect(Buffer.byteLength(html, "utf8")).toBeLessThan(90 * 1024)
    expect(html).not.toContain("data:font")
    expect(html).not.toContain("cid:")
    expect(html).not.toContain("localhost")
    expect(html).not.toContain("People. Shifts. Simplified")
  })
})
