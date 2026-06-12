import { Outlet, createFileRoute } from "@tanstack/react-router"

import { AccessDeniedState } from "@/components/errors/access-denied-state"
import { getWorkspaceDashboardPath } from "@/lib/organization-paths"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/settings",
)({
  component: SettingsRoute,
})

function SettingsRoute() {
  const { capabilities, viewer } = Route.useRouteContext()
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error("An active workspace is required for settings.")
  }

  if (!capabilities.canManageSettings) {
    return (
      <AccessDeniedState
        dashboardHref={getWorkspaceDashboardPath(activeWorkspace.slug)}
        description="Workspace settings are available to administrators and managers with configuration access."
      />
    )
  }

  return <Outlet />
}
