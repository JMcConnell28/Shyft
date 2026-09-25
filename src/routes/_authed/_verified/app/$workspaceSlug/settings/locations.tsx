import { createFileRoute, useLocation } from "@tanstack/react-router"

import { LocationsSettingsPage } from "@/features/settings/components/locations-settings-page"
import { locationSettingsQueryOptions } from "@/features/settings/query-options"
import { SettingsLayout } from "@/features/settings/components/settings-layout"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/settings/locations"
)({
  loader: ({ context }) => {
    const workspace = context.viewer.activeWorkspace

    if (!workspace) {
      throw new Error("An active workspace is required for location settings.")
    }

    return context.queryClient.ensureQueryData(
      locationSettingsQueryOptions({
        organizationId: workspace.id,
        userId: context.viewer.user.id,
      })
    )
  },
  component: WorkspaceLocationsSettingsRoute,
})

function WorkspaceLocationsSettingsRoute() {
  const { viewer } = Route.useRouteContext()
  const { workspaceSlug } = Route.useParams()
  const pathname = useLocation({
    select: (location) => location.pathname,
  })
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error(
      "An active organization workspace is required for settings."
    )
  }

  return (
    <SettingsLayout
      contentOnly
      workspaceSlug={workspaceSlug}
      activePath={pathname}
    >
      <LocationsSettingsPage
        organizationId={activeWorkspace.id}
        userId={viewer.user.id}
      />
    </SettingsLayout>
  )
}
