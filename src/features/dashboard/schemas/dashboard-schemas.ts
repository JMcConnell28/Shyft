import { z } from "zod"

const getDashboardShiftOverviewInputSchema = z.object({
  organizationId: z.string().trim().min(1).nullable(),
  userId: z.string().trim().min(1),
  locationId: z.uuid().optional(),
})

export { getDashboardShiftOverviewInputSchema }
