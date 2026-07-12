import type { z } from "zod"

import type {
  pushPayloadSchema,
  pushSubscriptionSchema,
} from "@/features/push-notifications/schemas/push-schemas"

type PushPayload = z.infer<typeof pushPayloadSchema>
type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>

type PushSendSummary = {
  failed: number
  removed: number
  sent: number
}

type PushSubscriptionState = {
  active: boolean
  endpoint: string | null
  updatedAt: string | null
}

export type {
  PushPayload,
  PushSendSummary,
  PushSubscriptionInput,
  PushSubscriptionState,
}
