import { createFileRoute, useLocation } from "@tanstack/react-router"

import { SettingsLayout } from "@/features/settings/components/settings-layout"
import { ZonesSettingsPage } from "@/features/settings/components/zones-settings-page"
import { rotaSettingsQueryOptions } from "@/features/settings/query-options"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/settings/rota/zones"
)({
  loader: ({ context }) => {
    const workspace = context.viewer.activeWorkspace
    if (!workspace)
      throw new Error("An active workspace is required for zone settings.")
    return context.queryClient.ensureQueryData(
      rotaSettingsQueryOptions({
        organizationId: workspace.id,
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
      activePath={pathname}
    >
      <ZonesSettingsPage
        organizationId={workspace.id}
        userId={viewer.user.id}
      />
    </SettingsLayout>
  )
}
