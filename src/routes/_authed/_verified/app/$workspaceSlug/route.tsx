import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router"

import type { WorkspaceSummary } from "@/features/onboarding/types"
import { DashboardShell } from "@/components/app/dashboard-shell"
import { getWorkspaceShellConfig } from "@/features/navigation/utils/workspace-shell"
import { getOrgCapabilitiesForRole } from "@/lib/auth/workspace-capabilities"
import { loadWorkspaceViewer } from "@/features/navigation/load-navigation-context"
import { useWorkspaceNotifications } from "@/features/notifications/hooks/use-workspace-notifications"

export const Route = createFileRoute("/_authed/_verified/app/$workspaceSlug")({
  beforeLoad: async ({ context, params, preload, location }) => {
    const viewer = await loadWorkspaceViewer(context, params.workspaceSlug, {
      preload,
      href: location.href,
    })

    const capabilities = getOrgCapabilitiesForRole(viewer.activeRole)

    return { capabilities, viewer }
  },
  component: WorkspaceRoute,
})

function WorkspaceRoute() {
  const { capabilities, viewer } = Route.useRouteContext()
  const pathname = useLocation({
    select: (location) => location.pathname,
  })
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error("An active workspace is required for this route.")
  }

  return (
    <WorkspaceShellRoute
      activeWorkspace={activeWorkspace}
      capabilities={capabilities}
      pathname={pathname}
      viewer={viewer}
    />
  )
}

function WorkspaceShellRoute({
  activeWorkspace,
  capabilities,
  pathname,
  viewer,
}: {
  activeWorkspace: WorkspaceSummary
  capabilities: ReturnType<typeof getOrgCapabilitiesForRole>
  pathname: string
  viewer: ReturnType<typeof Route.useRouteContext>["viewer"]
}) {
  const {
    hasError,
    hasUnreadAnnouncements,
    hasUnreadRotaUpdates,
    isLoading,
    recentAnnouncements,
    supportNotifications,
    supportUnreadCount,
  } = useWorkspaceNotifications({
    organizationId: activeWorkspace.id,
    userId: viewer.user.id,
    canUseSupport: capabilities.canUseSupport,
  })

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
      notificationsError={hasError}
      notificationsLoading={isLoading}
      recentAnnouncements={recentAnnouncements}
      supportNotifications={supportNotifications}
      supportUnreadCount={supportUnreadCount}
      canInviteTeamMembers={capabilities.canInviteTeamMembers}
      user={viewer.user}
      organizations={viewer.organizations}
      activeOrganization={viewer.activeOrganization}
      workspaces={viewer.workspaces}
      activeWorkspace={activeWorkspace}
      trial={viewer.trial}
      billing={viewer.billing}
      capabilities={capabilities}
      shiftSwapsEnabled={viewer.shiftSwapsEnabled}
    >
      <Outlet />
    </DashboardShell>
  )
}
