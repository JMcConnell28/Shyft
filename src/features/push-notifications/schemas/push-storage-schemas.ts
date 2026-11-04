import { z } from "zod"

const pushSubscriptionCountSchema = z.object({
  active_count: z.number().int().nonnegative(),
})

export { pushSubscriptionCountSchema }
