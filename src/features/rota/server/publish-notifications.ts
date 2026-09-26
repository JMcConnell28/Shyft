import "@tanstack/react-start/server-only"

import { randomUUID } from "node:crypto"

import { sendRotaPublishedEmail } from "@/features/email/server/rota-emails"
import { formatRotaPublishedWeek } from "@/features/email/utils/rota-published-schedule"
import { sendPushToUsers } from "@/features/push-notifications/server/push-service"
import { listRotaPublishedEmailRecipients } from "@/features/rota/server/publish-email-recipients"
import { buildAppUrl } from "@/lib/app-url.server"

type RotaPublishedNotificationResult = {
  errorMessage?: string
  pushSentCount?: number
  sentCount: number
}

async function sendRotaPublishedNotifications(input: {
  orgSlug: string
  locationSlug: string
  rotaId: string
}): Promise<RotaPublishedNotificationResult> {
  try {
    const { recipients, userIds, weekStart } =
      await listRotaPublishedEmailRecipients(input.rotaId)
    const rotaPath = getPublishedRotaPath(input)
    const rotaUrl = buildAppUrl(rotaPath)

    await Promise.all(
      recipients.map((recipient) =>
        sendRotaPublishedEmail({ ...recipient, rotaUrl, to: recipient.email })
      )
    )

    let pushSentCount = 0

    try {
      const weekLabel = weekStart
        ? formatRotaPublishedWeek(weekStart)
        : "your upcoming week"
      const pushSummary = await sendPushToUsers(userIds, {
        title: "New rota published",
        body: `Your rota for ${weekLabel} is ready.`,
        tag: `rota-published-${input.rotaId}`,
        data: { notificationId: randomUUID(), url: rotaPath },
      })
      pushSentCount = pushSummary.sent
    } catch (error) {
      console.error("Rota Web Push notifications failed", {
        rotaId: input.rotaId,
        message: error instanceof Error ? error.message : "Unknown push error",
      })
    }

    console.info(
      `Rota published email notifications sent for ${input.rotaId}: ${recipients.length}`
    )

    return { sentCount: recipients.length, pushSentCount }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Email delivery failed."

    console.error("Rota published email delivery failed.", error)

    return { errorMessage, sentCount: 0 }
  }
}

function getPublishedRotaPath(input: {
  orgSlug: string
  locationSlug: string
  rotaId: string
}): string {
  return `/app/${input.orgSlug}/rota/${input.locationSlug}/${input.rotaId}/view`
}

export { sendRotaPublishedNotifications }
export type { RotaPublishedNotificationResult }
