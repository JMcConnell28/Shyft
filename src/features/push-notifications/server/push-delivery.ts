import type {
  PushPayload,
  PushSendSummary,
} from "@/features/push-notifications/types"

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

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await dependencies.send(subscription, payload)
        summary.sent += 1
        await dependencies.onSent(subscription)
      } catch (error) {
        const statusCode = getPushStatusCode(error)

        if (statusCode === 404 || statusCode === 410) {
          summary.removed += 1
          await dependencies.onExpired(subscription)
          return
        }

        summary.failed += 1
        dependencies.onFailure(subscription, statusCode)
      }
    })
  )

  return summary
}

function getPushStatusCode(error: unknown) {
  if (typeof error === "object" && error && "statusCode" in error) {
    const statusCode = (error as { statusCode?: unknown }).statusCode
    return typeof statusCode === "number" ? statusCode : undefined
  }
  return undefined
}

export { deliverPushBatch }
