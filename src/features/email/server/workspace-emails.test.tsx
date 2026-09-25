import { render, toPlainText } from "@react-email/components"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { sendWorkspaceWelcomeEmail } from "@/features/email/server/workspace-emails"
import { sendTransactionalEmail } from "@/lib/email"

vi.mock("@/lib/email", () => ({
  sendTransactionalEmail: vi.fn(),
}))

describe("sendWorkspaceWelcomeEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("sends the new organisation template after setup", async () => {
    await sendWorkspaceWelcomeEmail({
      dashboardUrl: "https://example.com/w/the-crown/dashboard",
      to: "alex@example.com",
      userName: "Alex",
      workspaceName: "The Crown Group",
      workspaceType: "organization",
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

  it("preserves the existing location welcome email", async () => {
    await sendWorkspaceWelcomeEmail({
      dashboardUrl: "https://example.com/w/the-crown/dashboard",
      to: "alex@example.com",
      userName: "Alex",
      workspaceName: "The Crown Tavern",
      workspaceType: "location",
    })

    expect(sendTransactionalEmail).toHaveBeenCalledOnce()
    const email = vi.mocked(sendTransactionalEmail).mock.calls[0][0]
    expect(email.subject).toBe("The Crown Tavern is ready in RocketRota")
    expect(toPlainText(await render(email.react))).toContain(
      "YOUR WORKSPACE IS READY"
    )
  })
})
