import { dashboardWelcomeQueryOptions } from "./query-options"
import { shiftOverviewQueryOptions } from "./shift-overview-query-options"
import { getDashboardView } from "./utils/dashboard-view"
import type { QueryClient } from "@tanstack/react-query"
import type { DashboardView } from "./schemas/dashboard-search"
import type { OrganizationCapabilities } from "@/lib/auth/workspace-capabilities"
import { dashboardAnnouncementsQueryOptions } from "@/features/announcements/query-options"

async function loadDashboard({
  queryClient,
  workspace,
  userId,
  capabilities,
  search,
}: {
  queryClient: QueryClient
  workspace: { id: string; type: "organization" | "location" }
  userId: string
  capabilities: OrganizationCapabilities
  search: { view?: DashboardView; location?: string; date?: string }
}) {
  const input = { organizationId: workspace.id, userId }
  const welcomePromise = queryClient.ensureQueryData(
    dashboardWelcomeQueryOptions(workspace, userId)
  )

  if (getDashboardView(capabilities, search.view) === "manager") {
    const accessPromise = import("./manager/load-dashboard-access").then(
      ({ loadDashboardAccess }) =>
        loadDashboardAccess(queryClient, workspace.id, userId, search)
    )
    const [, welcome] = await Promise.all([accessPromise, welcomePromise])
    return { mode: "manager" as const, welcome }
  }

  const [announcements, overview, welcome] = await Promise.all([
    queryClient.ensureQueryData(dashboardAnnouncementsQueryOptions(input)),
    queryClient.ensureQueryData(shiftOverviewQueryOptions(input)),
    welcomePromise,
  ])
  return { mode: "employee" as const, announcements, overview, welcome }
}

export { loadDashboard }
