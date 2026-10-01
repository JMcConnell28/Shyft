import { beforeEach, describe, expect, it, vi } from "vitest"

import { sendAnnouncementPushNotifications } from "@/features/announcements/server/push-notifications"

const { recipients, sendPush } = vi.hoisted(() => ({
  recipients: vi.fn(),
  sendPush: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/features/announcements/server/push-recipients", () => ({
  listAnnouncementPushRecipients: recipients,
}))
vi.mock("@/features/push-notifications/server/push-service", () => ({
  sendPushToUsers: sendPush,
}))

beforeEach(() => vi.resetAllMocks())

const content = {
  title: "Team meeting",
  body: "Meet in the staff room at 10am.",
}

describe("announcement push notifications", () => {
  it("sends the announcement title and contents with a link to the correct workspace", async () => {
    recipients.mockResolvedValue([{ userId: "staff", workspaceSlug: "team" }])
    await sendAnnouncementPushNotifications("announcement-1", content)
    expect(sendPush).toHaveBeenCalledWith(["staff"], {
      title: content.title,
      body: content.body,
      tag: "announcement-announcement-1",
      data: {
        notificationId: "announcement-1",
        url: "/app/team/announcements",
      },
    })
  })

  it("does not invoke push delivery when there are no eligible recipients", async () => {
    recipients.mockResolvedValue([])
    await sendAnnouncementPushNotifications("announcement-1", content)
    expect(sendPush).not.toHaveBeenCalled()
  })

  it.each(["lookup", "delivery"])(
    "isolates %s failures from announcement creation",
    async (step) => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {})
      recipients.mockResolvedValue([{ userId: "staff", workspaceSlug: "team" }])
      const failingStep = step === "lookup" ? recipients : sendPush
      failingStep.mockRejectedValue(new Error("Unavailable"))
      await expect(
        sendAnnouncementPushNotifications("announcement-1", content)
      ).resolves.toBeUndefined()
      expect(log).toHaveBeenCalledWith(
        "Announcement Web Push notifications failed",
        {
          announcementId: "announcement-1",
          message: "Unavailable",
        }
      )
      log.mockRestore()
    }
  )
})
