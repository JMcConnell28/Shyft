import { z } from "zod"

const updateSupportThreadStatusSchema = z.object({
  id: z.uuid(),
  status: z.literal("resolved"),
})

const supportThreadIdSchema = z.object({ id: z.uuid() })
const supportListSchema = z.object({ page: z.number().int().nonnegative() })
const replyToSupportThreadSchema = supportThreadIdSchema.extend({
  body: z.string().trim().min(1).max(5000),
})

export {
  replyToSupportThreadSchema,
  supportThreadIdSchema,
  supportListSchema,
  updateSupportThreadStatusSchema,
}
