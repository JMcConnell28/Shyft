import { z } from "zod"

const joinRequestIdSchema = z.object({ requestId: z.uuid() })
const organizationJoinRequestsSchema = z.object({
  organizationId: z.string().min(1),
})
const decideJoinRequestSchema = organizationJoinRequestsSchema.extend({
  requestId: z.uuid(),
  decision: z.enum(["approved", "denied"]),
})

export {
  decideJoinRequestSchema,
  joinRequestIdSchema,
  organizationJoinRequestsSchema,
}
