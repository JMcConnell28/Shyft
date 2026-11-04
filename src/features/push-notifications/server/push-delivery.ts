import type {
  PushPayload,
  PushSendSummary,
} from "@/features/push-notifications/types"
import { PUSH_DELIVERY_CONCURRENCY } from "@/features/push-notifications/constants/push-limits"
import { BlockedPushEndpointError } from "@/features/push-notifications/utils/push-endpoint"

type DeliverySubscription = { id: string; userId: string }

type PushDeliveryDependencies<TSubscription extends DeliverySubscription> = {
  onExpired: (subscription: TSubscription) => Promise<void>
  onFailure: (
    subscription: TSubscription,
    statusCode: number | undefined
  ) => void
  onSent: (subscription: TSubscription) => Promise<void>
  send: (subscription: TSubscription, payload: PushPayload) => Promise<void>
}

async function deliverPushBatch<TSubscription extends DeliverySubscription>(
  subscriptions: Array<TSubscription>,
  payload: PushPayload,
  dependencies: PushDeliveryDependencies<TSubscription>
) {
  const summary: PushSendSummary = { failed: 0, removed: 0, sent: 0 }

  let nextIndex = 0
  await Promise.all(
    Array.from(
      { length: Math.min(PUSH_DELIVERY_CONCURRENCY, subscriptions.length) },
      async () => {
        while (nextIndex < subscriptions.length) {
          const subscription = subscriptions[nextIndex++]
          try {
            await dependencies.send(subscription, payload)
            summary.sent += 1
            await dependencies.onSent(subscription)
          } catch (error) {
            const statusCode = getPushStatusCode(error)

            if (
              statusCode === 404 ||
              statusCode === 410 ||
              error instanceof BlockedPushEndpointError
            ) {
              summary.removed += 1
              await dependencies.onExpired(subscription)
              continue
            }

            summary.failed += 1
            dependencies.onFailure(subscription, statusCode)
          }
        }
      }
    )
  )

  return summary
}

function getPushStatusCode(error: unknown) {
  if (typeof error === "object" && error && "statusCode" in error) {
    const statusCode = error.statusCode
    return typeof statusCode === "number" ? statusCode : undefined
  }
  return undefined
}

export { deliverPushBatch }
