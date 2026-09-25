import { createFileRoute, useLocation } from "@tanstack/react-router"

import { GeneralSettingsPage } from "@/features/settings/components/general-settings-page"
import { SettingsLayout } from "@/features/settings/components/settings-layout"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/settings/"
)({
  component: WorkspaceSettingsRoute,
})

function WorkspaceSettingsRoute() {
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
    <SettingsLayout workspaceSlug={workspaceSlug} activePath={pathname}>
      <GeneralSettingsPage
        organizationId={activeWorkspace.id}
        userId={viewer.user.id}
      />
    </SettingsLayout>
  )
}
