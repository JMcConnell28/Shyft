import { render, toPlainText } from "@react-email/components"
import { describe, expect, it } from "vitest"

import { ResetPasswordEmail } from "@/features/email/templates/reset-password"

describe("ResetPasswordEmail", () => {
  it("renders the reset link and security guidance in a compact branded email", async () => {
    const html = await render(
      <ResetPasswordEmail
        brandLogoUrl="https://example.com/pwa/icon-192.png"
        helpUrl="https://example.com/help"
        resetUrl="https://example.com/reset-password?token=abc"
      />
    )
    const content = toPlainText(html)

    expect(content).toContain("RESET YOUR PASSWORD")
    expect(content).toContain("This link will expire in 1 hour")
    expect(content).toContain("If you didn't request a password reset")
    expect(content).toContain("Help Centre")
    expect(html).toContain("https://example.com/pwa/icon-192.png")
    expect(html).toContain("https://example.com/reset-password?token=abc")
    expect(html).toContain("https://example.com/help")
    expect(content).not.toContain("People. Shifts. Simplified.")
    expect(Buffer.byteLength(html, "utf8")).toBeLessThan(90 * 1024)
  })
})
