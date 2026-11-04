import "@tanstack/react-start/server-only"

import { request } from "node:https"
import webPush from "web-push"
import type {
  PushPayload,
  PushSubscriptionInput,
} from "@/features/push-notifications/types"
import {
  PUSH_REQUEST_TIMEOUT_MS,
  PUSH_RESPONSE_MAX_BYTES,
  PUSH_SOCKET_TIMEOUT_MS,
} from "@/features/push-notifications/constants/push-limits"
import { pushEndpointSchema } from "@/features/push-notifications/schemas/push-schemas"
import { createPushAgent } from "@/features/push-notifications/server/push-agent"
import { BlockedPushEndpointError } from "@/features/push-notifications/utils/push-endpoint"

async function sendWebPush(
  subscription: PushSubscriptionInput,
  payload: PushPayload
): Promise<void> {
  if (!pushEndpointSchema.safeParse(subscription.endpoint).success) {
    throw new BlockedPushEndpointError()
  }
  const url = new URL(subscription.endpoint)
  const signal = AbortSignal.timeout(PUSH_REQUEST_TIMEOUT_MS)
  const agent = createPushAgent(url.hostname, signal)
  try {
    // Keep the library's encryption and VAPID signing; control the actual socket
    // here to enforce a total deadline, bounded responses and zero redirects.
    const details = webPush.generateRequestDetails(
      subscription,
      JSON.stringify(payload),
      {
        TTL: 60 * 60,
        urgency: "normal",
        topic: payload.tag?.replace(/[^A-Za-z0-9_-]/gu, "-").slice(0, 32),
      }
    )
    await new Promise<void>((resolve, reject) => {
      const outgoing = request(
        url,
        {
          agent,
          method: details.method,
          headers: details.headers,
          signal,
          timeout: PUSH_SOCKET_TIMEOUT_MS,
          maxHeaderSize: PUSH_RESPONSE_MAX_BYTES,
        },
        (response) => {
          let bytes = 0
          response.on("data", (chunk: Buffer) => {
            bytes += chunk.length
            if (bytes > PUSH_RESPONSE_MAX_BYTES) {
              response.destroy(
                new Error("Push response exceeded the size limit.")
              )
            }
          })
          response.on("error", reject)
          response.on("aborted", () =>
            reject(new Error("Push response was interrupted."))
          )
          response.on("end", () => {
            const statusCode = response.statusCode ?? 502
            if (statusCode >= 200 && statusCode < 300) resolve()
            else
              reject(
                Object.assign(
                  new Error("Push service rejected the notification."),
                  { statusCode }
                )
              )
          })
        }
      )
      outgoing.on("error", reject)
      outgoing.on("timeout", () =>
        outgoing.destroy(new Error("Push connection timed out."))
      )
      outgoing.end(details.body)
    })
  } finally {
    agent.destroy()
  }
}

export { sendWebPush }
