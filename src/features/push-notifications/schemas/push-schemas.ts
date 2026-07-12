import { z } from "zod"

const pushEndpointSchema = z.string().url().max(4096)

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

const pushEndpointInputSchema = z.object({ endpoint: pushEndpointSchema })
const pushStatusInputSchema = z.object({
  endpoint: pushEndpointSchema.optional(),
})

const pushPayloadSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(240),
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
  pushEndpointInputSchema,
  pushPayloadSchema,
  pushStatusInputSchema,
  pushSubscriptionSchema,
  savePushSubscriptionSchema,
}
