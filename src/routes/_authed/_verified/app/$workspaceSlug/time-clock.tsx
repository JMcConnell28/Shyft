import { createFileRoute } from "@tanstack/react-router"

import { AccessDeniedState } from "@/components/errors/access-denied-state"
import { ManagerTimeClockPage } from "@/features/time-clock/components/manager-time-clock-page"
import { getManagerClockPageData } from "@/features/time-clock/server-fns"
import { getWorkspaceDashboardPath } from "@/lib/organization-paths"

type TimeClockSearch = {
  date?: string
}

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/time-clock"
)({
  validateSearch: (search: Record<string, unknown>): TimeClockSearch => ({
    date: typeof search.date === "string" ? search.date : undefined,
  }),
  loaderDeps: ({ search }) => ({ date: search.date }),
  loader: async ({ context, deps }) => {
    const activeWorkspace = context.viewer.activeWorkspace

    if (!activeWorkspace) {
      throw new Error("An active workspace is required.")
    }

    if (!context.capabilities.canManageTimeClock) {
      return { status: "forbidden" as const }
    }

    const data = await getManagerClockPageData({
      data: {
        date: deps.date,
        organizationId: activeWorkspace.id,
        userId: context.viewer.user.id,
      },
    })

    return { data, status: "allowed" as const }
  },
  component: WorkspaceTimeClockRoute,
})

function WorkspaceTimeClockRoute() {
  const { viewer } = Route.useRouteContext()
  const result = Route.useLoaderData()
  const search = Route.useSearch()
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error("An active workspace is required.")
  }

  if (result.status === "forbidden") {
    return (
      <AccessDeniedState
        dashboardHref={getWorkspaceDashboardPath(activeWorkspace.slug)}
        description="The time clock is available to supervisors, managers, and workspace administrators."
      />
    )
  }

  return (
    <ManagerTimeClockPage
      initialData={result.data}
      date={search.date}
      organizationId={activeWorkspace.id}
      userId={viewer.user.id}
      workspaceSlug={activeWorkspace.slug}
    />
  )
}
