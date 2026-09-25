import { Link } from "@tanstack/react-router"
import * as React from "react"

import LocationName from "./location-name"
import type { OrganizationCapabilities } from "@/lib/auth/get-org-capabilities"
import type { OrganizationAppRouteKey } from "@/lib/organization-paths"
import type { OrganizationSummary, WorkspaceSummary } from "@/lib/onboarding"
import { navItems } from "@/components/app/shell/nav-items"
import { SidebarInviteLink } from "@/components/app/shell/sidebar-invite-link"
import { SidebarInviteDialog } from "@/components/app/shell/sidebar-invite-dialog"
import { UserMenu } from "@/components/app/shell/user-menu"
// eslint-disable-next-line no-duplicate-imports
import {
  getWorkspaceAccountPath,
  getWorkspaceAppPath,
} from "@/lib/organization-paths"
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
  useSidebar,
} from "@/components/ui/sidebar"

function AppSidebar({
  routeKey,
  isSigningOut,
  onSignOut,
  hasUnreadRotaUpdates,
  hasUnreadAnnouncements,
  canInviteTeamMembers,
  mobileTrialBanner,
  user,
  activeOrganization,
  activeWorkspace,
  capabilities,
}: {
  routeKey: OrganizationAppRouteKey
  isSigningOut: boolean
  onSignOut: () => void
  hasUnreadRotaUpdates?: boolean
  hasUnreadAnnouncements?: boolean
  canInviteTeamMembers?: boolean
  mobileTrialBanner?: React.ReactNode
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
  const { isMobile, setOpenMobile } = useSidebar()
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const visibleNavItems = navItems.filter(
    (item) => !item.requiredCapability || capabilities[item.requiredCapability]
  )

  function handleOpenInvite() {
    if (isMobile) {
      setOpenMobile(false)
    }
    setInviteOpen(true)
  }

  return (
    <>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="items-center max-md:p-0 sm:justify-center">
          <LocationName
            activeOrganization={activeOrganization}
            activeWorkspace={activeWorkspace}
          />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="max-md:px-6 max-md:py-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5 max-md:gap-3">
                {visibleNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={
                        activeWorkspace ? (
                          <Link
                            to={getWorkspaceAppPath(
                              activeWorkspace.slug,
                              item.routeKey
                            )}
                            onClick={() => setOpenMobile(false)}
                            className="font-bold sm:justify-start sm:text-foreground"
                          />
                        ) : (
                          <a
                            href="/dashboard"
                            onClick={() => setOpenMobile(false)}
                          />
                        )
                      }
                      tooltip={item.title}
                      isActive={routeKey === item.routeKey}
                      className="max-md:text-md max-md:h-10 max-md:gap-4 max-md:rounded-xl max-md:px-5 max-md:font-bold max-md:tracking-[-0.03em] max-md:text-[#071a54] max-md:shadow-none max-md:data-active:border-[#0069ff]/20 max-md:data-active:bg-[#eef3ff] max-md:data-active:font-medium max-md:data-active:text-[#0069ff] max-md:data-active:shadow-sm max-md:[&_svg]:size-7"
                    >
                      <div className="relative flex shrink-0">
                        <item.icon />
                        {item.routeKey === "rota" && hasUnreadRotaUpdates ? (
                          <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-rose-500 ring-2 ring-sidebar" />
                        ) : null}
                        {item.routeKey === "announcements" &&
                        hasUnreadAnnouncements ? (
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

          {mobileTrialBanner}
        </SidebarContent>

        <SidebarFooter className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2 max-md:gap-4 max-md:p-4">
          {canInviteTeamMembers ? (
            <SidebarInviteLink onOpen={handleOpenInvite} />
          ) : null}
          <UserMenu
            accountHref={
              activeWorkspace
                ? getWorkspaceAccountPath(activeWorkspace.slug)
                : "/account"
            }
            isSigningOut={isSigningOut}
            onSignOut={onSignOut}
            user={user}
          />
        </SidebarFooter>
      </Sidebar>
      {canInviteTeamMembers && inviteOpen ? (
        <SidebarInviteDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          scopeId={activeOrganization?.id ?? activeWorkspace?.id ?? "none"}
        />
      ) : null}
    </>
  )
}

export { AppSidebar }
