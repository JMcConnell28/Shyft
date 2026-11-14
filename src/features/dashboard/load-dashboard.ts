import { dashboardWelcomeQueryOptions } from "./query-options"
import { shiftOverviewQueryOptions } from "./shift-overview-query-options"
import type { QueryClient } from "@tanstack/react-query"
import { dashboardAnnouncementsQueryOptions } from "@/features/announcements/query-options"

async function loadDashboard({
  queryClient,
  workspace,
  userId,
}: {
  queryClient: QueryClient
  workspace: { id: string; type: "organization" | "location" }
  userId: string
}) {
  const input = { organizationId: workspace.id, userId }
  void queryClient.prefetchQuery(
    dashboardWelcomeQueryOptions(workspace, userId)
  )

  const [announcements, overview] = await Promise.all([
    queryClient.ensureQueryData(dashboardAnnouncementsQueryOptions(input)),
    queryClient.ensureQueryData(shiftOverviewQueryOptions(input)),
  ])
  return { announcements, overview }
}

export { loadDashboard }
