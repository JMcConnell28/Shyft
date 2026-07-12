import { createServerFn } from "@tanstack/react-start"

import {
  pushEndpointInputSchema,
  pushStatusInputSchema,
  savePushSubscriptionSchema,
} from "@/features/push-notifications/schemas/push-schemas"

const savePushSubscription = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => savePushSubscriptionSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/push-notifications/server/actions")
    return module.saveCurrentPushSubscription(data)
  })

const removePushSubscription = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => pushEndpointInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/push-notifications/server/actions")
    return module.removeCurrentPushSubscription(data)
  })

const getPushSubscriptionStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => pushStatusInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/push-notifications/server/actions")
    return module.readCurrentPushSubscriptionState(data)
  })

const sendTestPushToCurrentDevice = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => pushEndpointInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/push-notifications/server/actions")
    return module.sendCurrentDeviceTestPush(data)
  })

const sendTestPushToCurrentUser = createServerFn({ method: "POST" }).handler(
  async () => {
    const module = await import("@/features/push-notifications/server/actions")
    return module.sendCurrentUserTestPush()
  }
)

export {
  getPushSubscriptionStatus,
  removePushSubscription,
  savePushSubscription,
  sendTestPushToCurrentDevice,
  sendTestPushToCurrentUser,
}
