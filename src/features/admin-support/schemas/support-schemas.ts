import { z } from "zod"

const createSupportThreadSchema = z.object({
  body: z.string().trim().min(1).max(5000),
  category: z.enum(["support", "bug", "feature_request"]).default("support"),
  locationId: z.uuid().nullable().optional(),
  organizationId: z.string().nullable().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  subject: z.string().trim().min(2).max(160),
  userId: z.string().min(1),
})

export { createSupportThreadSchema }
