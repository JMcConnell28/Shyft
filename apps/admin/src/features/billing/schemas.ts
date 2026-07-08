import { z } from "zod"

const extendTrialSchema = z.object({
  days: z.number().int().min(1).max(90),
  locationId: z.uuid(),
  reason: z.string().trim().min(5).max(500),
})

export { extendTrialSchema }
