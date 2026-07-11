import { createFileRoute, useLocation } from "@tanstack/react-router"

import { GeneralSettingsPage } from "@/features/settings/components/general-settings-page"
import { LocationsSettingsPage } from "@/features/settings/components/locations-settings-page"
import {
  generalSettingsQueryOptions,
  locationSettingsQueryOptions,
} from "@/features/settings/query-options"
import { SettingsLayout } from "@/features/settings/components/settings-layout"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/settings/general"
)({
  loader: ({ context }) => {
    const workspace = context.viewer.activeWorkspace

    if (!workspace) {
      throw new Error("An active workspace is required for settings.")
    }

    return workspace.type === "organization"
      ? context.queryClient.ensureQueryData(
          generalSettingsQueryOptions({
            organizationId: workspace.id,
            userId: context.viewer.user.id,
          })
        )
      : context.queryClient.ensureQueryData(
          locationSettingsQueryOptions({
            locationId: workspace.id,
            userId: context.viewer.user.id,
          })
        )
  },
  component: WorkspaceGeneralSettingsRoute,
})

function WorkspaceGeneralSettingsRoute() {
  const { viewer } = Route.useRouteContext()
  const { workspaceSlug } = Route.useParams()
  const pathname = useLocation({ select: (location) => location.pathname })
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
      {activeWorkspace.type === "organization" ? (
        <GeneralSettingsPage
          organizationId={activeWorkspace.id}
          userId={viewer.user.id}
        />
      ) : (
        <LocationsSettingsPage
          locationId={activeWorkspace.id}
          userId={viewer.user.id}
        />
      )}
    </SettingsLayout>
  )
}
