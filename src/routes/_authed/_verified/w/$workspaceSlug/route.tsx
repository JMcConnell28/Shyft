import {
  Outlet,
  createFileRoute,
  redirect,
  useLocation,
} from "@tanstack/react-router"

import { DashboardShell } from "@/components/app/dashboard-shell"
import { getHasUnreadAnnouncements } from "@/features/announcements/server-fns"
import { getWorkspaceShellConfig } from "@/features/navigation/utils/workspace-shell"
import { getOrgCapabilitiesForRole } from "@/lib/auth/workspace-capabilities"
import { getViewerStateForWorkspaceSlug } from "@/lib/onboarding"
import { getHasUnreadRotaUpdates } from "@/lib/rota"

export const Route = createFileRoute("/_authed/_verified/w/$workspaceSlug")({
  beforeLoad: async ({ context, params }) => {
    const currentViewer = context.viewer
    const viewer =
      currentViewer.activeWorkspace?.slug === params.workspaceSlug
        ? currentViewer
        : await getViewerStateForWorkspaceSlug({
            data: {
              workspaceSlug: params.workspaceSlug,
            },
          })

    if (!viewer?.activeWorkspace) {
      throw redirect({ to: "/dashboard" })
    }

    const capabilities = getOrgCapabilitiesForRole(viewer.activeRole)

    return { capabilities, viewer }
  },
  loader: async ({ context }) => {
    const activeWorkspace = context.viewer.activeWorkspace

    if (!activeWorkspace) {
      return {
        hasUnreadAnnouncements: false,
        hasUnreadRotaUpdates: false,
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
    const [hasUnreadAnnouncements, hasUnreadRotaUpdates] = await Promise.all([
      getHasUnreadAnnouncements({
        data: unreadInput,
      }),
      getHasUnreadRotaUpdates({
        data: unreadInput,
      }),
    ])

    return {
      hasUnreadAnnouncements,
      hasUnreadRotaUpdates,
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
  const { canInviteTeamMembers, hasUnreadAnnouncements, hasUnreadRotaUpdates } =
    Route.useLoaderData()
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
      hasUnreadRotaUpdates={hasUnreadRotaUpdates}
      hasUnreadAnnouncements={hasUnreadAnnouncements}
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
