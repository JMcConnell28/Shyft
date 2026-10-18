import { z } from "zod"
import { managerDashboardSearchSchema } from "@/features/dashboard/manager/schemas"

const dashboardViewSchema = z.enum(["personal", "manager"])
const dashboardSearchSchema = managerDashboardSearchSchema.extend({
  view: dashboardViewSchema.optional().catch(undefined),
})

type DashboardView = z.infer<typeof dashboardViewSchema>

export { dashboardSearchSchema }
export type { DashboardView }
