import { z } from "zod"
import { managerDashboardSearchSchema } from "@/features/dashboard/manager/schemas"

const legacyDashboardSearchSchema = managerDashboardSearchSchema.extend({
  view: z.enum(["personal", "manager"]).optional().catch(undefined),
})

export { legacyDashboardSearchSchema }
