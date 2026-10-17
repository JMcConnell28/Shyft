import { createFileRoute, useLocation } from "@tanstack/react-router"

import { GeneralSettingsPage } from "@/features/settings/components/general-settings-page"
import { SettingsLayout } from "@/features/settings/components/settings-layout"
import { generalSettingsQueryOptions } from "@/features/settings/query-options"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/settings/"
)({
  staleTime: 0,
  preloadStaleTime: 0,
  loader: ({ context }) => {
    if (!context.capabilities.canManageSettings) return null
    const workspace = context.viewer.activeWorkspace
    if (!workspace) throw new Error("An active workspace is required.")
    return context.queryClient.ensureQueryData({
      ...generalSettingsQueryOptions({
        organizationId: workspace.id,
        userId: context.viewer.user.id,
      }),
      revalidateIfStale: true,
    })
  },
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
