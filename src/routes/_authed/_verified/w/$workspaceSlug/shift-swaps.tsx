import { createFileRoute } from "@tanstack/react-router"

import { AccessDeniedState } from "@/components/errors/access-denied-state"
import { ShiftSwapPage } from "@/features/shift-swaps/components/shift-swap-page"
import { getShiftSwapPageData } from "@/features/shift-swaps/server-fns"
import { getWorkspaceDashboardPath } from "@/lib/organization-paths"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/shift-swaps"
)({
  loader: async ({ context }) => {
    const activeWorkspace = context.viewer.activeWorkspace

    if (!activeWorkspace) {
      throw new Error("An active workspace is required.")
    }

    if (!context.capabilities.canViewRota) {
      return { status: "forbidden" as const }
    }

    const data = await getShiftSwapPageData({
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
  component: WorkspaceShiftSwapsRoute,
})

function WorkspaceShiftSwapsRoute() {
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
        description="Shift swaps are available to workspaces with rota access."
      />
    )
  }

  return (
    <ShiftSwapPage
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
