import { z } from "zod"

const supportScopeSchema = z.object({ organizationId: z.string().min(1) })
const supportListSchema = supportScopeSchema.extend({
  page: z.number().int().nonnegative(),
})
const supportThreadIdSchema = supportScopeSchema.extend({ threadId: z.uuid() })
const supportMessageSchema = z.string().trim().min(1).max(5000)

const createSupportThreadSchema = supportScopeSchema.extend({
  subject: z.string().trim().min(2).max(160),
  category: z.enum(["support", "bug", "feature_request"]),
  locationId: z.uuid().nullable().default(null),
  body: supportMessageSchema,
})

const replyToSupportThreadSchema = supportThreadIdSchema.extend({
  body: supportMessageSchema,
})

export {
  createSupportThreadSchema,
  replyToSupportThreadSchema,
  supportListSchema,
  supportScopeSchema,
  supportThreadIdSchema,
}
