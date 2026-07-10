import { createFileRoute, useLocation } from "@tanstack/react-router"

import { SettingsLayout } from "@/features/settings/components/settings-layout"
import { ClockSettingsPage } from "@/features/time-clock/components/clock-settings-page"
import { getClockSettingsPageData } from "@/features/time-clock/server-fns"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/settings/clocking",
)({
  loader: async ({ context }) => {
    const activeWorkspace = context.viewer.activeWorkspace

    if (!activeWorkspace) {
      throw new Error("An active workspace is required.")
    }

    return getClockSettingsPageData({
      data:
        activeWorkspace.type === "organization"
          ? {
              organizationId: activeWorkspace.id,
              userId: context.viewer.user.id,
            }
          : {
              locationId: activeWorkspace.id,
              userId: context.viewer.user.id,
            },
    })
  },
  component: WorkspaceClockingSettingsRoute,
})

function WorkspaceClockingSettingsRoute() {
  const { viewer } = Route.useRouteContext()
  const { workspaceSlug } = Route.useParams()
  const data = Route.useLoaderData()
  const pathname = useLocation({
    select: (location) => location.pathname,
  })
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error("An active workspace is required for clock settings.")
  }

  return (
    <SettingsLayout
      workspaceSlug={workspaceSlug}
      workspaceType={activeWorkspace.type}
      activePath={pathname}
    >
      <ClockSettingsPage
        initialData={data}
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
