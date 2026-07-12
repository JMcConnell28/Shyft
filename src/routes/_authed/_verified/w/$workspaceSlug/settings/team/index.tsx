import { createFileRoute, useLocation } from "@tanstack/react-router"

import { SettingsLayout } from "@/features/settings/components/settings-layout"
import { StaffGroupDashboardPage } from "@/features/staff-groups/components/staff-group-dashboard-page"
import { staffGroupSettingsQueryOptions } from "@/features/staff-groups/query-options"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/settings/team/"
)({
  loader: ({ context }) => {
    const workspace = context.viewer.activeWorkspace
    if (!workspace)
      throw new Error("An active workspace is required for team settings.")
    return context.queryClient.ensureQueryData(
      staffGroupSettingsQueryOptions({
        organizationId:
          workspace.type === "organization" ? workspace.id : undefined,
        locationId: workspace.type === "location" ? workspace.id : undefined,
        userId: context.viewer.user.id,
      })
    )
  },
  component: WorkspaceTeamSettingsIndexRoute,
})

function WorkspaceTeamSettingsIndexRoute() {
  const { viewer } = Route.useRouteContext()
  const { workspaceSlug } = Route.useParams()
  const pathname = useLocation({ select: (location) => location.pathname })
  const workspace = viewer.activeWorkspace
  if (!workspace)
    throw new Error("An active workspace is required for team settings.")
  return (
    <SettingsLayout
      workspaceSlug={workspaceSlug}
      workspaceType={workspace.type}
      activePath={pathname}
    >
      <StaffGroupDashboardPage
        organizationId={
          workspace.type === "organization" ? workspace.id : undefined
        }
        locationId={workspace.type === "location" ? workspace.id : undefined}
        userId={viewer.user.id}
        workspaceSlug={workspaceSlug}
      />
    </SettingsLayout>
  )
}
