import { createFileRoute, useLocation } from "@tanstack/react-router"

import { SettingsLayout } from "@/features/settings/components/settings-layout"
import { ZonesSettingsPage } from "@/features/settings/components/zones-settings-page"
import { rotaSettingsQueryOptions } from "@/features/settings/query-options"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/settings/rota/zones"
)({
  loader: ({ context }) => {
    const workspace = context.viewer.activeWorkspace
    if (!workspace)
      throw new Error("An active workspace is required for zone settings.")
    return context.queryClient.ensureQueryData(
      rotaSettingsQueryOptions({
        organizationId:
          workspace.type === "organization" ? workspace.id : undefined,
        locationId: workspace.type === "location" ? workspace.id : undefined,
        userId: context.viewer.user.id,
      })
    )
  },
  component: WorkspaceZonesSettingsRoute,
})

function WorkspaceZonesSettingsRoute() {
  const { viewer } = Route.useRouteContext()
  const { workspaceSlug } = Route.useParams()
  const pathname = useLocation({ select: (location) => location.pathname })
  const workspace = viewer.activeWorkspace
  if (!workspace)
    throw new Error("An active workspace is required for zone settings.")
  return (
    <SettingsLayout
      contentOnly
      workspaceSlug={workspaceSlug}
      workspaceType={workspace.type}
      activePath={pathname}
    >
      <ZonesSettingsPage
        organizationId={
          workspace.type === "organization" ? workspace.id : undefined
        }
        locationId={workspace.type === "location" ? workspace.id : undefined}
        userId={viewer.user.id}
      />
    </SettingsLayout>
  )
}
