import { createFileRoute, useLocation } from "@tanstack/react-router"

import { SettingsLayout } from "@/features/settings/components/settings-layout"
import { WorkspaceConnectionsPage } from "@/features/settings/components/workspace-connections-page"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/settings/connections",
)({
  component: WorkspaceConnectionsSettingsRoute,
})

function WorkspaceConnectionsSettingsRoute() {
  const { viewer } = Route.useRouteContext()
  const { workspaceSlug } = Route.useParams()
  const pathname = useLocation({
    select: (location) => location.pathname,
  })
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error("An active workspace is required for settings.")
  }

  return (
    <SettingsLayout
      workspaceSlug={workspaceSlug}
      workspaceType={activeWorkspace.type}
      activePath={pathname}
    >
      <WorkspaceConnectionsPage
        organizationId={
          activeWorkspace.type === "organization" ? activeWorkspace.id : undefined
        }
        locationId={
          activeWorkspace.type === "location" ? activeWorkspace.id : undefined
        }
        userId={viewer.user.id}
      />
    </SettingsLayout>
  )
}
