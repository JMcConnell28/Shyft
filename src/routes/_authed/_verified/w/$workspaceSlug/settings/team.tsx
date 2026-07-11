import { createFileRoute, useLocation } from "@tanstack/react-router"

import { SettingsLayout } from "@/features/settings/components/settings-layout"
import { StaffGroupDashboardPage } from "@/features/staff-groups/components/staff-group-dashboard-page"
import { staffGroupSettingsQueryOptions } from "@/features/staff-groups/query-options"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/settings/team"
)({
  loader: ({ context }) => {
    const workspace = context.viewer.activeWorkspace

    if (!workspace) {
      throw new Error("An active workspace is required for team settings.")
    }

    return context.queryClient.ensureQueryData(
      staffGroupSettingsQueryOptions({
        organizationId:
          workspace.type === "organization" ? workspace.id : undefined,
        locationId: workspace.type === "location" ? workspace.id : undefined,
        userId: context.viewer.user.id,
      })
    )
  },
  component: WorkspaceTeamSettingsRoute,
})

function WorkspaceTeamSettingsRoute() {
  const { viewer } = Route.useRouteContext()
  const { workspaceSlug } = Route.useParams()
  const pathname = useLocation({
    select: (location) => location.pathname,
  })
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error("An active workspace is required for team settings.")
  }

  return (
    <SettingsLayout
      workspaceSlug={workspaceSlug}
      workspaceType={activeWorkspace.type}
      activePath={pathname}
    >
      <StaffGroupDashboardPage
        organizationId={
          activeWorkspace.type === "organization"
            ? activeWorkspace.id
            : undefined
        }
        locationId={
          activeWorkspace.type === "location" ? activeWorkspace.id : undefined
        }
        userId={viewer.user.id}
      />
    </SettingsLayout>
  )
}
