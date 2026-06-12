import { createFileRoute, useLocation } from "@tanstack/react-router"

import { RotaSettingsPage } from "@/features/settings/components/rota-settings-page"
import { SettingsLayout } from "@/features/settings/components/settings-layout"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/settings/rota",
)({
  component: WorkspaceRotaSettingsRoute,
})

function WorkspaceRotaSettingsRoute() {
  const { viewer } = Route.useRouteContext()
  const { workspaceSlug } = Route.useParams()
  const pathname = useLocation({
    select: (location) => location.pathname,
  })
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error("An active workspace is required for rota settings.")
  }

  return (
    <SettingsLayout
      workspaceSlug={workspaceSlug}
      workspaceType={activeWorkspace.type}
      activePath={pathname}
    >
      <RotaSettingsPage
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
