import { createFileRoute, redirect, useLocation } from "@tanstack/react-router"

import { LocationsSettingsPage } from "@/features/settings/components/locations-settings-page"
import { SettingsLayout } from "@/features/settings/components/settings-layout"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/settings/locations",
)({
  beforeLoad: ({ context, params }) => {
    if (context.viewer.activeWorkspace?.type === "location") {
      throw redirect({
        to: "/w/$workspaceSlug/settings",
        params: {
          workspaceSlug: params.workspaceSlug,
        },
      })
    }
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

  if (!activeWorkspace || activeWorkspace.type !== "organization") {
    throw new Error("An active organization workspace is required for settings.")
  }

  return (
    <SettingsLayout
      workspaceSlug={workspaceSlug}
      workspaceType={activeWorkspace.type}
      activePath={pathname}
    >
      <LocationsSettingsPage
        organizationId={activeWorkspace.id}
        userId={viewer.user.id}
      />
    </SettingsLayout>
  )
}
