import { createFileRoute } from "@tanstack/react-router"

import { LocationsSettingsPage } from "@/features/settings/components/locations-settings-page"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/settings/locations/"
)({
  component: LocationsIndexRoute,
})

function LocationsIndexRoute() {
  const { viewer } = Route.useRouteContext()
  const { workspaceSlug } = Route.useParams()
  const workspace = viewer.activeWorkspace
  if (!workspace) throw new Error("An active workspace is required.")

  return (
    <LocationsSettingsPage
      organizationId={workspace.id}
      userId={viewer.user.id}
      workspaceSlug={workspaceSlug}
    />
  )
}
