import { createFileRoute, useLocation } from "@tanstack/react-router"

import { RotaSettingsPage } from "@/features/settings/components/rota-settings-page"
import { SettingsLayout } from "@/features/settings/components/settings-layout"
import { rotaSettingsQueryOptions } from "@/features/settings/query-options"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/settings/rota/"
)({
  loader: ({ context }) => {
    const workspace = context.viewer.activeWorkspace
    if (!workspace)
      throw new Error("An active workspace is required for rota settings.")
    return context.queryClient.ensureQueryData(
      rotaSettingsQueryOptions({
        organizationId:
          workspace.type === "organization" ? workspace.id : undefined,
        locationId: workspace.type === "location" ? workspace.id : undefined,
        userId: context.viewer.user.id,
      })
    )
  },
  component: WorkspaceRotaSettingsIndexRoute,
})

function WorkspaceRotaSettingsIndexRoute() {
  const { viewer } = Route.useRouteContext()
  const { workspaceSlug } = Route.useParams()
  const pathname = useLocation({ select: (location) => location.pathname })
  const workspace = viewer.activeWorkspace
  if (!workspace)
    throw new Error("An active workspace is required for rota settings.")
  return (
    <SettingsLayout
      workspaceSlug={workspaceSlug}
      workspaceType={workspace.type}
      activePath={pathname}
    >
      <RotaSettingsPage
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
