import { z } from "zod"

import { PUSH_BODY_MAX_LENGTH } from "@/features/push-notifications/constants/push-limits"
import { isSupportedPushEndpoint } from "@/features/push-notifications/utils/push-endpoint"

// Removal/status must still accept historical endpoints so users can disable them.
const storedPushEndpointSchema = z.string().url().max(4096)
// Check the raw value: URL normalization must not erase control characters first.
const pushEndpointSchema = z
  .string()
  .max(4096)
  .refine(
    isSupportedPushEndpoint,
    "This browser's notification service is not supported."
  )

const pushSubscriptionSchema = z.object({
  endpoint: pushEndpointSchema,
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    auth: z.string().min(8).max(256),
    p256dh: z.string().min(20).max(512),
  }),
})

const savePushSubscriptionSchema = z.object({
  deviceDescription: z.string().trim().max(160).optional(),
  platform: z.string().trim().max(160).optional(),
  subscription: pushSubscriptionSchema,
})

const pushEndpointInputSchema = z.object({ endpoint: storedPushEndpointSchema })
const pushStatusInputSchema = z.object({
  endpoint: storedPushEndpointSchema.optional(),
})

const pushPayloadSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(PUSH_BODY_MAX_LENGTH),
  icon: z.string().startsWith("/").max(200).optional(),
  badge: z.string().startsWith("/").max(200).optional(),
  tag: z.string().trim().min(1).max(120).optional(),
  renotify: z.boolean().optional(),
  data: z
    .object({
      notificationId: z.string().uuid().optional(),
      url: z
        .string()
        .min(1)
        .max(500)
        .refine((value) => value.startsWith("/") && !value.startsWith("//"), {
          message: "Notification URLs must be internal paths.",
        }),
    })
    .optional(),
})

export {
  pushEndpointSchema,
  pushEndpointInputSchema,
  pushPayloadSchema,
  pushStatusInputSchema,
  pushSubscriptionSchema,
  savePushSubscriptionSchema,
}
