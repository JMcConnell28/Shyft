import { createFileRoute } from "@tanstack/react-router"

import { AccessDeniedState } from "@/components/errors/access-denied-state"
import { ManagerTimeClockPage } from "@/features/time-clock/components/manager-time-clock-page"
import { getManagerClockPageData } from "@/features/time-clock/server-fns"
import { getWorkspaceDashboardPath } from "@/lib/organization-paths"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/time-clock",
)({
  loader: async ({ context }) => {
    const activeWorkspace = context.viewer.activeWorkspace

    if (!activeWorkspace) {
      throw new Error("An active workspace is required.")
    }

    if (!context.capabilities.canManageTimeClock) {
      return { status: "forbidden" as const }
    }

    const data = await getManagerClockPageData({
      data:
        activeWorkspace.type === "organization"
          ? {
              organizationId: activeWorkspace.id,
              userId: context.viewer.user.id,
            }
          : {
              locationId: activeWorkspace.id,
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
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error("An active workspace is required.")
  }

  if (result.status === "forbidden") {
    return (
      <AccessDeniedState
        dashboardHref={getWorkspaceDashboardPath(activeWorkspace.slug)}
        description="The time clock is available to managers and workspace administrators."
      />
    )
  }

  return (
    <ManagerTimeClockPage
      initialData={result.data}
      organizationId={
        activeWorkspace.type === "organization" ? activeWorkspace.id : undefined
      }
      locationId={
        activeWorkspace.type === "location" ? activeWorkspace.id : undefined
      }
      userId={viewer.user.id}
    />
  )
}
