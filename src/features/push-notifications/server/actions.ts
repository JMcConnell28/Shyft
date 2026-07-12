import "@tanstack/react-start/server-only"

import { randomUUID } from "node:crypto"

import { getRequestHeaders } from "@tanstack/react-start/server"
import type { z } from "zod"

import type {
  pushEndpointInputSchema,
  pushStatusInputSchema,
  savePushSubscriptionSchema,
} from "@/features/push-notifications/schemas/push-schemas"
import {
  getPushSubscriptionState,
  revokePushSubscription,
  upsertPushSubscription,
} from "@/features/push-notifications/server/subscriptions"
import {
  sendPushToCurrentDevice,
  sendPushToUser,
} from "@/features/push-notifications/server/push-service"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { getOptionalEnv, getRequiredEnv } from "@/lib/env.server"

type SaveInput = z.infer<typeof savePushSubscriptionSchema>
type EndpointInput = z.infer<typeof pushEndpointInputSchema>
type StatusInput = z.infer<typeof pushStatusInputSchema>

const lastTestAtByUser = new Map<string, number>()

async function readPushPublicConfig() {
  await requireVerifiedSessionOrThrow()
  return { publicKey: getRequiredEnv("VAPID_PUBLIC_KEY") }
}

async function saveCurrentPushSubscription(input: SaveInput) {
  const { session } = await requireVerifiedSessionOrThrow()
  const requestHeaders = getRequestHeaders()

  await upsertPushSubscription({
    ...input,
    userAgent: requestHeaders.get("user-agent") ?? undefined,
    userId: session.user.id,
  })

  return { success: true }
}

async function removeCurrentPushSubscription(input: EndpointInput) {
  const { session } = await requireVerifiedSessionOrThrow()
  await revokePushSubscription({
    endpoint: input.endpoint,
    userId: session.user.id,
  })
  return { success: true }
}

async function readCurrentPushSubscriptionState(input: StatusInput) {
  const { session } = await requireVerifiedSessionOrThrow()
  return getPushSubscriptionState({
    endpoint: input.endpoint,
    userId: session.user.id,
  })
}

async function sendCurrentDeviceTestPush(input: EndpointInput) {
  if (getOptionalEnv("PUSH_TESTING_ENABLED") !== "true") {
    throw new Error("Push testing is not enabled.")
  }

  const { session } = await requireVerifiedSessionOrThrow()
  enforceTestRateLimit(session.user.id)

  return sendPushToCurrentDevice(session.user.id, input.endpoint, {
    title: "RocketRota notifications are working",
    body: "This device is ready to receive rota updates.",
    tag: "push-test",
    data: { notificationId: randomUUID(), url: "/dashboard" },
  })
}

async function sendCurrentUserTestPush() {
  if (getOptionalEnv("PUSH_TESTING_ENABLED") !== "true") {
    throw new Error("Push testing is not enabled.")
  }

  const { session } = await requireVerifiedSessionOrThrow()
  enforceTestRateLimit(session.user.id)

  return sendPushToUser(session.user.id, {
    title: "RocketRota notifications are working",
    body: "Your subscribed RocketRota devices are ready for updates.",
    tag: "push-user-test",
    data: { notificationId: randomUUID(), url: "/dashboard" },
  })
}

function enforceTestRateLimit(userId: string) {
  const now = Date.now()
  const lastSentAt = lastTestAtByUser.get(userId) ?? 0

  if (now - lastSentAt < 10_000) {
    throw new Error("Wait a few seconds before sending another test.")
  }

  lastTestAtByUser.set(userId, now)
}

export {
  readPushPublicConfig,
  readCurrentPushSubscriptionState,
  removeCurrentPushSubscription,
  saveCurrentPushSubscription,
  sendCurrentDeviceTestPush,
  sendCurrentUserTestPush,
}
