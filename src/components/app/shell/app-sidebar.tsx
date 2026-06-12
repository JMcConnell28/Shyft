import { Link } from "@tanstack/react-router"

import type { OrganizationSummary, WorkspaceSummary } from "@/lib/onboarding"
import {
  getWorkspaceAppPath,
  getWorkspaceAccountPath,
  type OrganizationAppRouteKey,
} from "@/lib/organization-paths"
import { SidebarInviteLink } from "@/components/app/shell/sidebar-invite-link"
import { navItems } from "@/components/app/shell/nav-items"
import { UserMenu } from "@/components/app/shell/user-menu"
import { WorkspaceSwitcher } from "@/components/app/shell/workspace-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { OrganizationCapabilities } from "@/lib/auth/get-org-capabilities"


function AppSidebar({
  routeKey,
  isSigningOut,
  onSignOut,
  hasUnreadRotaUpdates,
  canInviteTeamMembers,
  user,
  organizations,
  activeOrganization,
  workspaces,
  activeWorkspace,
  capabilities,
}: {
  routeKey: OrganizationAppRouteKey
  isSigningOut: boolean
  onSignOut: () => void
  hasUnreadRotaUpdates?: boolean
  canInviteTeamMembers?: boolean
  user: {
    name: string
    email: string
  }
  organizations: Array<OrganizationSummary>
  activeOrganization: OrganizationSummary | null
  workspaces: Array<WorkspaceSummary>
  activeWorkspace: WorkspaceSummary | null
  capabilities: OrganizationCapabilities
}) {
  const visibleNavItems = navItems.filter(
    (item) =>
      !item.requiredCapability || capabilities[item.requiredCapability],
  )

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <WorkspaceSwitcher
          organizations={organizations}
          activeOrganization={activeOrganization}
          workspaces={workspaces}
          activeWorkspace={activeWorkspace}
          routeKey={routeKey}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={
                      activeWorkspace ? (
                        <Link
                          to={getWorkspaceAppPath(activeWorkspace.slug, item.routeKey)}
                        />
                      ) : (
                        <a href="/dashboard" />
                      )
                    }
                    tooltip={item.title}
                    isActive={routeKey === item.routeKey}
                  >
                    <div className="relative flex shrink-0">
                      <item.icon />
                      {item.routeKey === "rota" && hasUnreadRotaUpdates ? (
                        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-rose-500 ring-2 ring-sidebar" />
                      ) : null}
                    </div>
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {canInviteTeamMembers ? <SidebarInviteLink /> : null}
        <UserMenu
          accountHref={
            activeWorkspace ? getWorkspaceAccountPath(activeWorkspace.slug) : "/account"
          }
          isSigningOut={isSigningOut}
          onSignOut={onSignOut}
          user={user}
        />
      </SidebarFooter>
    </Sidebar>
  )
}

export { AppSidebar }
