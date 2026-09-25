import { render, toPlainText } from "@react-email/components"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { sendOrganizationWelcomeEmail } from "@/features/email/server/organization-welcome-email"
import { sendTransactionalEmail } from "@/lib/email"

vi.mock("@/lib/email", () => ({
  sendTransactionalEmail: vi.fn(),
}))

describe("sendOrganizationWelcomeEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("sends the new organisation template after setup", async () => {
    await sendOrganizationWelcomeEmail({
      dashboardUrl: "https://example.com/app/the-crown/dashboard",
      to: "alex@example.com",
      userName: "Alex",
      organizationName: "The Crown Group",
    })

    expect(sendTransactionalEmail).toHaveBeenCalledOnce()
    const email = vi.mocked(sendTransactionalEmail).mock.calls[0][0]
    expect(email.subject).toBe(
      "Welcome to RocketRota — The Crown Group is ready"
    )
    expect(email.text).toContain("Your first location is set up")
    expect(toPlainText(await render(email.react))).toContain(
      "WELCOME TO ROCKETROTA"
    )
  })
})
