import "@tanstack/react-start/server-only"

import webPush from "web-push"
import { z } from "zod"

import type { PushPayload } from "@/features/push-notifications/types"
import { deliverPushBatch } from "@/features/push-notifications/server/push-delivery"
import {
  listActivePushSubscriptionsForUsers,
  markPushSubscriptionUsed,
  revokePushSubscriptionById,
} from "@/features/push-notifications/server/subscriptions"
import { pushPayloadSchema } from "@/features/push-notifications/schemas/push-schemas"
import { getRequiredEnv } from "@/lib/env.server"

const vapidConfigSchema = z.object({
  privateKey: z.string().min(20),
  publicKey: z.string().min(20),
  subject: z
    .string()
    .refine(isValidVapidSubject, "Use an HTTPS URL or mailto address."),
})

let configured = false

function configureWebPush() {
  if (configured) return

  const config = vapidConfigSchema.parse({
    privateKey: getRequiredEnv("VAPID_PRIVATE_KEY"),
    publicKey: getRequiredEnv("VAPID_PUBLIC_KEY"),
    subject: getRequiredEnv("VAPID_SUBJECT"),
  })
  webPush.setVapidDetails(config.subject, config.publicKey, config.privateKey)
  configured = true
}

async function sendPushToUser(userId: string, payload: PushPayload) {
  return sendPushToUsers([userId], payload)
}

async function sendPushToCurrentDevice(
  userId: string,
  endpoint: string,
  payload: PushPayload
) {
  configureWebPush()
  const safePayload = pushPayloadSchema.parse(payload)
  const subscriptions = await listActivePushSubscriptionsForUsers([userId])
  const subscription = subscriptions.find((item) => item.endpoint === endpoint)

  if (!subscription) {
    throw new Error("This device is not subscribed to notifications.")
  }

  return sendPushBatch([subscription], safePayload)
}

async function sendPushToUsers(userIds: Array<string>, payload: PushPayload) {
  configureWebPush()
  const safePayload = pushPayloadSchema.parse(payload)
  const subscriptions = await listActivePushSubscriptionsForUsers([
    ...new Set(userIds),
  ])

  return sendPushBatch(subscriptions, safePayload)
}

async function sendPushBatch(
  subscriptions: Awaited<
    ReturnType<typeof listActivePushSubscriptionsForUsers>
  >,
  safePayload: PushPayload
) {
  return deliverPushBatch(
    subscriptions.map((subscription) => ({
      ...subscription,
      userId: subscription.user_id,
    })),
    safePayload,
    {
      send: async (subscription, payload) => {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              auth: subscription.auth_key,
              p256dh: subscription.p256dh_key,
            },
          },
          JSON.stringify(payload),
          {
            TTL: 60 * 60,
            urgency: "normal",
            topic: toPushTopic(payload.tag),
          }
        )
      },
      onSent: (subscription) => markPushSubscriptionUsed(subscription.id),
      onExpired: (subscription) => revokePushSubscriptionById(subscription.id),
      onFailure: (subscription, statusCode) => {
        console.error("Web Push delivery failed", {
          statusCode,
          userId: subscription.userId,
        })
      },
    }
  )
}

function toPushTopic(tag?: string) {
  return tag?.replace(/[^A-Za-z0-9_-]/gu, "-").slice(0, 32)
}

function isValidVapidSubject(value: string) {
  if (value.startsWith("mailto:")) return value.length > "mailto:".length
  try {
    return new URL(value).protocol === "https:"
  } catch {
    return false
  }
}

export { sendPushToCurrentDevice, sendPushToUser, sendPushToUsers }
