import { render, toPlainText } from "@react-email/components"
import { describe, expect, it } from "vitest"

import { OrganizationWelcomeEmail } from "@/features/email/templates/organization-welcome"

describe("OrganizationWelcomeEmail", () => {
  it("renders a compact welcome message for an already-created organisation", async () => {
    const html = await render(
      <OrganizationWelcomeEmail
        brandLogoUrl="https://example.com/pwa/icon-192.png"
        dashboardUrl="https://example.com/app/the-crown/dashboard"
        helpUrl="https://example.com/help"
        organizationName="The Crown Group"
        userName="Alex"
        welcomeGraphicUrl="https://example.com/brand/organization-welcome.png"
      />
    )
    const content = toPlainText(html)

    expect(content).toContain("WELCOME TO ROCKETROTA")
    expect(content).toContain("The Crown Group is ready to go")
    expect(content).toContain("Open dashboard")
    expect(content.match(/Open dashboard/g)).toHaveLength(1)
    expect(content).toContain("Invite your team")
    expect(content).toContain("Build your first rota")
    expect(content).toContain("Set up billing")
    expect(html).toContain("https://example.com/brand/organization-welcome.png")
    expect(html).toContain("https://example.com/app/the-crown/dashboard")
    expect(content).not.toContain("Set up your workspace")
    expect(content).not.toContain("Create your first location")
    expect(content).not.toContain("People. Shifts. Simplified.")
    expect(Buffer.byteLength(html, "utf8")).toBeLessThan(90 * 1024)
  })
})
