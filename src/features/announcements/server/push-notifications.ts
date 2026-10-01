import "@tanstack/react-start/server-only"

import { listAnnouncementPushRecipients } from "@/features/announcements/server/push-recipients"
import { getAnnouncementPushPreview } from "@/features/announcements/utils/announcement-push-preview"
import { sendPushToUsers } from "@/features/push-notifications/server/push-service"
import { getWorkspaceAnnouncementsPath } from "@/lib/organization-paths"

async function sendAnnouncementPushNotifications(
  announcementId: string,
  content: { title: string; body: string }
): Promise<void> {
  try {
    const recipients = await listAnnouncementPushRecipients(announcementId)
    const workspaceSlug = recipients[0]?.workspaceSlug
    if (!workspaceSlug) return

    await sendPushToUsers(
      recipients.map((recipient) => recipient.userId),
      {
        title: content.title,
        body: getAnnouncementPushPreview(content.body),
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
