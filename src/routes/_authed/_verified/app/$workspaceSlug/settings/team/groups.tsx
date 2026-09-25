import { createFileRoute, useLocation } from "@tanstack/react-router"

import { SettingsLayout } from "@/features/settings/components/settings-layout"
import { StaffGroupsSettingsPage } from "@/features/staff-groups/components/staff-groups-settings-page"
import { staffGroupSettingsQueryOptions } from "@/features/staff-groups/query-options"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/settings/team/groups"
)({
  loader: ({ context }) => {
    const workspace = context.viewer.activeWorkspace
    if (!workspace)
      throw new Error("An active workspace is required for group settings.")
    return context.queryClient.ensureQueryData(
      staffGroupSettingsQueryOptions({
        organizationId: workspace.id,
        userId: context.viewer.user.id,
      })
    )
  },
  component: WorkspaceGroupsSettingsRoute,
})

function WorkspaceGroupsSettingsRoute() {
  const { viewer } = Route.useRouteContext()
  const { workspaceSlug } = Route.useParams()
  const pathname = useLocation({ select: (location) => location.pathname })
  const workspace = viewer.activeWorkspace
  if (!workspace)
    throw new Error("An active workspace is required for group settings.")
  return (
    <SettingsLayout
      contentOnly
      workspaceSlug={workspaceSlug}
      activePath={pathname}
    >
      <StaffGroupsSettingsPage
        organizationId={workspace.id}
        userId={viewer.user.id}
        workspaceSlug={workspaceSlug}
      />
    </SettingsLayout>
  )
}
