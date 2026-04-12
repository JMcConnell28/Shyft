import {
  Outlet,
  createFileRoute,
  redirect,
  useLocation,
} from "@tanstack/react-router"

import { DashboardShell } from "@/components/app/dashboard-shell"
import { getOrgWorkspaceShellConfig } from "@/features/navigation/utils/org-workspace-shell"
import {
  getPendingOnboardingPath,
  requireActiveOrganization,
} from "@/features/onboarding/utils/viewer-route-redirects"
import { getViewerStateForOrganizationSlug } from "@/lib/onboarding"
import { getHasUnreadRotaUpdates } from "@/lib/rota"

export const Route = createFileRoute("/_authed/_verified/o/$orgSlug")({
  beforeLoad: async ({ params }) => {
    const viewer = await getViewerStateForOrganizationSlug({
      data: {
        orgSlug: params.orgSlug,
      },
    })

    if (!viewer?.activeOrganization) {
      throw redirect({ to: "/dashboard" })
    }

    const pendingOnboardingPath = getPendingOnboardingPath(viewer)

    if (pendingOnboardingPath) {
      throw redirect({ to: pendingOnboardingPath })
    }

    return { viewer }
  },
  loader: async ({ context }) => {
    const activeOrganization = requireActiveOrganization(context.viewer)

    return getHasUnreadRotaUpdates({
      data: {
        organizationId: activeOrganization.id,
        userId: context.viewer.user.id,
      },
    })
  },
  component: OrganizationWorkspaceRoute,
})

function OrganizationWorkspaceRoute() {
  const { viewer } = Route.useRouteContext()
  const { orgSlug } = Route.useParams()
  const pathname = useLocation({
    select: (location) => location.pathname,
  })
  const hasUnreadRotaUpdates = Route.useLoaderData()
  const activeOrganization = requireActiveOrganization(viewer)
  const shellConfig = getOrgWorkspaceShellConfig(pathname, orgSlug)

  return (
    <DashboardShell
      routeKey={shellConfig.routeKey}
      title={shellConfig.title}
      description={shellConfig.description}
      hasUnreadRotaUpdates={hasUnreadRotaUpdates}
      user={viewer.user}
      organizations={viewer.organizations}
      activeOrganization={activeOrganization}
    >
      <Outlet />
    </DashboardShell>
  )
}
