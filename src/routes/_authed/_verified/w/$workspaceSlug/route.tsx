import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router"

import { DashboardShell } from "@/components/app/dashboard-shell"
import { getDashboardAnnouncements } from "@/features/announcements/server-fns"
import { getWorkspaceShellConfig } from "@/features/navigation/utils/workspace-shell"
import { getOrgCapabilitiesForRole } from "@/lib/auth/workspace-capabilities"
import { loadWorkspaceViewer } from "@/features/navigation/load-navigation-context"
import { getHasUnreadRotaUpdates } from "@/lib/rota"

export const Route = createFileRoute("/_authed/_verified/w/$workspaceSlug")({
  beforeLoad: async ({ context, params, preload, location }) => {
    const viewer = await loadWorkspaceViewer(context, params.workspaceSlug, {
      preload,
      href: location.href,
    })

    const capabilities = getOrgCapabilitiesForRole(viewer.activeRole)

    return { capabilities, viewer }
  },
  loader: async ({ context }) => {
    const activeWorkspace = context.viewer.activeWorkspace

    if (!activeWorkspace) {
      return {
        hasUnreadAnnouncements: false,
        hasUnreadRotaUpdates: false,
        recentAnnouncements: [],
        canInviteTeamMembers: false,
      }
    }

    const unreadInput =
      activeWorkspace.type === "organization"
        ? {
            organizationId: activeWorkspace.id,
            userId: context.viewer.user.id,
          }
        : {
            locationId: activeWorkspace.id,
            userId: context.viewer.user.id,
          }
    const [dashboardAnnouncements, hasUnreadRotaUpdates] = await Promise.all([
      getDashboardAnnouncements({
        data: unreadInput,
      }),
      getHasUnreadRotaUpdates({
        data: unreadInput,
      }),
    ])

    return {
      hasUnreadAnnouncements: dashboardAnnouncements.unreadCount > 0,
      hasUnreadRotaUpdates,
      recentAnnouncements: dashboardAnnouncements.announcements,
      canInviteTeamMembers: context.capabilities.canInviteTeamMembers,
    }
  },
  component: WorkspaceRoute,
})

function WorkspaceRoute() {
  const { capabilities, viewer } = Route.useRouteContext()
  const pathname = useLocation({
    select: (location) => location.pathname,
  })
  const {
    canInviteTeamMembers,
    hasUnreadAnnouncements,
    hasUnreadRotaUpdates,
    recentAnnouncements,
  } = Route.useLoaderData()
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error("An active workspace is required for this route.")
  }

  const shellConfig = getWorkspaceShellConfig(pathname, activeWorkspace)

  return (
    <DashboardShell
      routeKey={shellConfig.routeKey}
      title={shellConfig.title}
      description={shellConfig.description}
      backLink={shellConfig.backLink}
      mobileBrandHeader={shellConfig.mobileBrandHeader}
      hasUnreadRotaUpdates={hasUnreadRotaUpdates}
      hasUnreadAnnouncements={hasUnreadAnnouncements}
      recentAnnouncements={recentAnnouncements}
      canInviteTeamMembers={canInviteTeamMembers}
      user={viewer.user}
      organizations={viewer.organizations}
      activeOrganization={viewer.activeOrganization}
      workspaces={viewer.workspaces}
      activeWorkspace={activeWorkspace}
      trial={viewer.trial}
      billing={viewer.billing}
      capabilities={capabilities}
    >
      <Outlet />
    </DashboardShell>
  )
}
