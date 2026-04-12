import { Link } from "@tanstack/react-router"

import type { OrganizationSummary } from "@/lib/onboarding"
import type { OrganizationAppRouteKey } from "@/lib/organization-paths"
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


function AppSidebar({
  routeKey,
  isSigningOut,
  onSignOut,
  hasUnreadRotaUpdates,
  user,
  organizations,
  activeOrganization,
}: {
  routeKey: OrganizationAppRouteKey
  isSigningOut: boolean
  onSignOut: () => void
  hasUnreadRotaUpdates?: boolean
  user: {
    name: string
    email: string
  }
  organizations: Array<OrganizationSummary>
  activeOrganization: OrganizationSummary | null
}) {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <WorkspaceSwitcher
          organizations={organizations}
          activeOrganization={activeOrganization}
          routeKey={routeKey}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={
                      activeOrganization ? (
                        <Link
                          to={
                            item.routeKey === "dashboard"
                              ? "/o/$orgSlug/dashboard"
                              : "/o/$orgSlug/rota"
                          }
                          params={{ orgSlug: activeOrganization.slug }}
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
        <UserMenu
          isSigningOut={isSigningOut}
          onSignOut={onSignOut}
          user={user}
        />
      </SidebarFooter>
    </Sidebar>
  )
}

export { AppSidebar }
