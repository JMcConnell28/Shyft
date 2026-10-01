import "@tanstack/react-start/server-only"

import { listAnnouncementPushRecipients } from "@/features/announcements/server/push-recipients"
import { sendPushToUsers } from "@/features/push-notifications/server/push-service"
import { getWorkspaceAnnouncementsPath } from "@/lib/organization-paths"

async function sendAnnouncementPushNotifications(
  announcementId: string
): Promise<void> {
  try {
    const recipients = await listAnnouncementPushRecipients(announcementId)
    const workspaceSlug = recipients[0]?.workspaceSlug
    if (!workspaceSlug) return

    await sendPushToUsers(
      recipients.map((recipient) => recipient.userId),
      {
        title: "New announcement",
        body: "A new announcement has been posted for your team.",
        tag: `announcement-${announcementId}`,
        data: {
          notificationId: announcementId,
          url: getWorkspaceAnnouncementsPath(workspaceSlug),
        },
      }
    )
  } catch (error) {
    console.error("Announcement Web Push notifications failed", {
      announcementId,
      message: error instanceof Error ? error.message : "Unknown push error",
    })
  }
}

export { sendAnnouncementPushNotifications }
