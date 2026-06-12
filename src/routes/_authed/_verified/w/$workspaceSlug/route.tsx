import {
  Outlet,
  createFileRoute,
  redirect,
  useLocation,
} from "@tanstack/react-router"

import { DashboardShell } from "@/components/app/dashboard-shell"
import { isWorkspaceBillingBlocked } from "@/features/billing/utils/billing-access"
import { getWorkspaceShellConfig } from "@/features/navigation/utils/workspace-shell"
import { getWorkspaceCapabilities } from "@/lib/auth/auth-server-fns"
import { getViewerStateForWorkspaceSlug } from "@/lib/onboarding"
import { getHasUnreadRotaUpdates } from "@/lib/rota"

export const Route = createFileRoute("/_authed/_verified/w/$workspaceSlug")({
  beforeLoad: async ({ params }) => {
    const viewer = await getViewerStateForWorkspaceSlug({
      data: {
        workspaceSlug: params.workspaceSlug,
      },
    })

    if (!viewer?.activeWorkspace) {
      throw redirect({ to: "/dashboard" })
    }

    if (isWorkspaceBillingBlocked({ trial: viewer.trial, billing: viewer.billing })) {
      throw redirect({ to: "/billing/expired" })
    }

    const activeWorkspace = viewer.activeWorkspace
    const capabilities = await getWorkspaceCapabilities({
      data:
        activeWorkspace.type === "organization"
          ? {
              organizationId: activeWorkspace.id,
              userId: viewer.user.id,
            }
          : {
              locationId: activeWorkspace.id,
              userId: viewer.user.id,
            },
    })

    return { capabilities, viewer }
  },
  loader: async ({ context }) => {
    const activeWorkspace = context.viewer.activeWorkspace

    if (!activeWorkspace) {
      return {
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
    const hasUnreadRotaUpdates = await getHasUnreadRotaUpdates({
      data: unreadInput,
    })

    return {
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
  const { canInviteTeamMembers, hasUnreadRotaUpdates } = Route.useLoaderData()
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
