import { createServerFn } from "@tanstack/react-start"

import { getDashboardShiftOverviewInputSchema } from "@/features/dashboard/schemas/dashboard-schemas"
import { dashboardWelcomeWorkspaceSchema } from "@/features/dashboard/schemas/welcome-schemas"

const getDashboardShiftOverview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    getDashboardShiftOverviewInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/dashboard/server/shift-overview")
    return module.getDashboardShiftOverview(data)
  })

const getDashboardWelcome = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    dashboardWelcomeWorkspaceSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/dashboard/server/welcome")
    return module.getDashboardWelcomeState(data)
  })

const dismissDashboardWelcome = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    dashboardWelcomeWorkspaceSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/dashboard/server/welcome")
    return module.dismissDashboardWelcome(data)
  })

export {
  dismissDashboardWelcome,
  getDashboardShiftOverview,
  getDashboardWelcome,
}
