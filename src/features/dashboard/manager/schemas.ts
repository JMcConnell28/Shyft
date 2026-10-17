import { z } from "zod"
import { isoDateSchema } from "@/features/rota/schemas/rota-schemas"

const managerScopeSchema = z.object({
  organizationId: z.string().trim().min(1),
})
const managerDayInputSchema = managerScopeSchema.extend({
  locationId: z.uuid(),
  date: isoDateSchema.optional(),
})
const attentionInputSchema = managerScopeSchema.extend({
  page: z.number().int().min(1).default(1),
})
const resolveArrivalSchema = managerScopeSchema.extend({
  locationId: z.uuid(),
  assignmentId: z.uuid(),
  segment: z.enum(["full", "split_first", "split_second"]),
  scheduledStartAt: z.iso.datetime({ offset: true }),
  reason: z.string().trim().min(5).max(500),
})
const managerDashboardSearchSchema = z.object({
  location: z.uuid().optional().catch(undefined),
  date: isoDateSchema.optional().catch(undefined),
})

export {
  managerScopeSchema,
  managerDayInputSchema,
  attentionInputSchema,
  resolveArrivalSchema,
  managerDashboardSearchSchema,
}
