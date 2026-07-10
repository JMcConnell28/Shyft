import { createFileRoute, useLocation } from "@tanstack/react-router"

import { BillingSettingsPage } from "@/features/billing/components/billing-settings-page"
import { getOrganizationBillingOverview } from "@/features/billing/server-fns"
import { SettingsLayout } from "@/features/settings/components/settings-layout"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/settings/billing"
)({
  loader: async ({ context }) => {
    const workspace = context.viewer.activeWorkspace
    return workspace?.type === "organization"
      ? getOrganizationBillingOverview({
          data: { organizationId: workspace.id },
        })
      : []
  },
  component: WorkspaceBillingSettingsRoute,
})

function WorkspaceBillingSettingsRoute() {
  const { viewer } = Route.useRouteContext()
  const { workspaceSlug } = Route.useParams()
  const pathname = useLocation({
    select: (location) => location.pathname,
  })
  const activeWorkspace = viewer.activeWorkspace
  const organizationLocations = Route.useLoaderData()

  if (!activeWorkspace) {
    throw new Error("An active workspace is required for billing settings.")
  }

  return (
    <SettingsLayout
      workspaceSlug={workspaceSlug}
      workspaceType={activeWorkspace.type}
      activePath={pathname}
    >
      <BillingSettingsPage
        billing={viewer.billing}
        trial={viewer.trial}
        organizationId={
          activeWorkspace.type === "organization"
            ? activeWorkspace.id
            : undefined
        }
        locationId={
          activeWorkspace.type === "location" ? activeWorkspace.id : undefined
        }
        organizationLocations={organizationLocations}
      />
    </SettingsLayout>
  )
}
