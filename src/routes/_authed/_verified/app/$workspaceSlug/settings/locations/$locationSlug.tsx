import { createFileRoute } from "@tanstack/react-router"

import { LocationDetailsPage } from "@/features/settings/components/location-details-page"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/settings/locations/$locationSlug"
)({
  component: LocationDetailsRoute,
})

function LocationDetailsRoute() {
  const { viewer } = Route.useRouteContext()
  const { workspaceSlug, locationSlug } = Route.useParams()
  const workspace = viewer.activeWorkspace
  if (!workspace) throw new Error("An active workspace is required.")

  return (
    <LocationDetailsPage
      organizationId={workspace.id}
      userId={viewer.user.id}
      workspaceSlug={workspaceSlug}
      locationSlug={locationSlug}
    />
  )
}
