import * as React from "react"
import { Link } from "@tanstack/react-router"
import { ArrowLeftIcon, SettingsIcon } from "lucide-react"
import { TooltipProvider } from "../ui/tooltip"
import type {
  WorkspaceBillingState,
  WorkspaceTrial,
} from "@/features/billing/types"
import type { DashboardAnnouncement } from "@/features/announcements/types"
import type { OrganizationCapabilities } from "@/lib/auth/get-org-capabilities"
import type { OrganizationSummary, WorkspaceSummary } from "@/lib/onboarding"
import { BrandMark } from "@/components/app/brand"
import { AppSidebar } from "@/components/app/shell/app-sidebar"
import { ShellBody } from "@/components/app/shell/shell-body"
import { PastDueBillingNotice } from "@/features/billing/components/past-due-billing-notice"
import { TrialBanner } from "@/features/billing/components/trial-banner"
import { NotificationMenu } from "@/features/notifications/components/notification-menu"
import { authClient } from "@/lib/auth-client"
import {
  getWorkspaceAppPath,
  getWorkspaceDashboardPath,
  getWorkspaceSettingsPath,
} from "@/lib/organization-paths"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

function DashboardShell({
  routeKey,
  title,
  description,
  backLink,
  children,
  hasUnreadRotaUpdates,
  hasUnreadAnnouncements,
  recentAnnouncements = [],
  canInviteTeamMembers,
  user,
  organizations,
  activeOrganization,
  workspaces = [],
  activeWorkspace,
  trial,
  billing,
  capabilities,
}: {
  routeKey: React.ComponentProps<typeof AppSidebar>["routeKey"]
  title: string
  description: string
  backLink?: {
    href: string
    label: string
  }
  children?: React.ReactNode
  hasUnreadRotaUpdates?: boolean
  hasUnreadAnnouncements?: boolean
  recentAnnouncements?: Array<DashboardAnnouncement>
  canInviteTeamMembers?: boolean
  user: {
    name: string
    email: string
  }
  organizations: Array<OrganizationSummary>
  activeOrganization: OrganizationSummary | null
  workspaces?: Array<WorkspaceSummary>
  activeWorkspace?: WorkspaceSummary | null
  trial?: WorkspaceTrial | null
  billing?: WorkspaceBillingState | null
  capabilities: OrganizationCapabilities
}) {
  const [isSigningOut, setIsSigningOut] = React.useState(false)
  const resolvedActiveWorkspace =
    activeWorkspace ??
    (activeOrganization
      ? {
          id: activeOrganization.id,
          name: activeOrganization.name,
          slug: activeOrganization.slug,
          type: "organization" as const,
          organizationId: activeOrganization.id,
        }
      : null)
  const isDashboardHome = routeKey === "dashboard" && !backLink
  const isRotaListHome = routeKey === "rota"
  const isSettingsHome = routeKey === "settings"
  const isTimesheetsHome = routeKey === "timesheets"
  const isTimeClockHome = routeKey === "timeClock"
  const isAnnouncementsHome = routeKey === "announcements"
  const hasMobileBrandHeader =
    isDashboardHome ||
    isRotaListHome ||
    isSettingsHome ||
    isTimesheetsHome ||
    isTimeClockHome ||
    isAnnouncementsHome
  const canViewTrialBanner =
    capabilities.canManageRota || Boolean(canInviteTeamMembers)

  const handleSignOut = React.useCallback(async () => {
    setIsSigningOut(true)

    const result = await authClient.signOut()

    if (result.error) {
      setIsSigningOut(false)
      return
    }

    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }, [])

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          routeKey={routeKey}
          isSigningOut={isSigningOut}
          onSignOut={() => {
            void handleSignOut()
          }}
          hasUnreadRotaUpdates={hasUnreadRotaUpdates}
          hasUnreadAnnouncements={hasUnreadAnnouncements}
          canInviteTeamMembers={canInviteTeamMembers}
          user={user}
          organizations={organizations}
          activeOrganization={activeOrganization}
          workspaces={workspaces}
          activeWorkspace={resolvedActiveWorkspace}
          capabilities={capabilities}
        />
        <SidebarInset className="min-h-0 overflow-hidden">
          <header
            className={cn(
              "sticky top-0 z-20 flex shrink-0 items-center gap-3 backdrop-blur md:static md:h-12 md:border-b md:bg-card md:px-4",
              hasMobileBrandHeader
                ? "h-[4.75rem] border-b-0 bg-background/95 px-4"
                : "h-12 border-b bg-background/95 px-4"
            )}
          >
            <SidebarTrigger
              className={cn(
                "-ml-1 md:hidden",
                hasMobileBrandHeader &&
                  "size-11 rounded-xl bg-white text-[#142453] shadow-[0_4px_14px_rgba(30,50,96,0.08)] ring-1 ring-[#e7eaf2] hover:bg-white"
              )}
            />
            {hasMobileBrandHeader ? (
              <Link
                to={getWorkspaceAppPath(
                  activeWorkspace?.slug ?? "",
                  "dashboard"
                )}
                className="flex w-full min-w-0 items-center justify-center gap-2.5 md:hidden"
              >
                <BrandMark className="size-8 rounded-none bg-transparent p-0 shadow-none ring-0" />
                <div>
                  <span className="truncate text-lg font-extrabold tracking-[-0.025em] text-[#0d1b3d]">
                    Rocket
                  </span>
                  <span className="truncate text-lg font-extrabold tracking-[-0.025em] text-[#2f6bff]">
                    Rota
                  </span>
                </div>
              </Link>
            ) : null}
            {backLink ? (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 text-muted-foreground",
                  hasMobileBrandHeader && "hidden md:inline-flex"
                )}
                nativeButton={false}
                render={<Link to={backLink.href} />}
              >
                <ArrowLeftIcon className="size-3.5" />
                <span className="hidden sm:inline">{backLink.label}</span>
                <span className="sm:hidden">Back</span>
              </Button>
            ) : null}
            <Breadcrumb
              className={cn(hasMobileBrandHeader && "hidden md:block")}
            >
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  {activeWorkspace?.type === "location" ? (
                    <BreadcrumbLink
                      render={
                        <Link
                          to={getWorkspaceDashboardPath(activeWorkspace.slug)}
                        />
                      }
                    >
                      {activeWorkspace.name}
                    </BreadcrumbLink>
                  ) : activeOrganization ? (
                    <BreadcrumbLink
                      render={
                        <Link
                          to={getWorkspaceDashboardPath(
                            activeOrganization.slug
                          )}
                        />
                      }
                    >
                      {activeOrganization.name}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbLink render={<Link to="/dashboard" />}>
                      RocketRota
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <NotificationMenu
              announcements={recentAnnouncements}
              hasUnreadRotaUpdates={Boolean(hasUnreadRotaUpdates)}
              prominent={hasMobileBrandHeader}
              workspaceSlug={activeWorkspace?.slug ?? ""}
            />
            {capabilities.canManageSettings &&
            activeWorkspace?.type === "location" ? (
              <Button
                variant="pill"
                size="icon"
                className={cn(
                  hasMobileBrandHeader &&
                    "size-11 rounded-xl bg-white text-[#142453] shadow-[0_4px_14px_rgba(30,50,96,0.08)] ring-1 ring-[#e7eaf2] hover:bg-white md:size-8 md:rounded-full"
                )}
                nativeButton={false}
                render={
                  <Link
                    to={getWorkspaceSettingsPath(activeWorkspace.slug)}
                    viewTransition={{
                      types: ["slide-left"],
                    }}
                  />
                }
              >
                <SettingsIcon />
                <span className="sr-only">Settings</span>
              </Button>
            ) : capabilities.canManageSettings && activeOrganization ? (
              <Button
                variant="pill"
                size="icon"
                className={cn(
                  hasMobileBrandHeader &&
                    "size-11 rounded-xl bg-white text-[#142453] shadow-[0_4px_14px_rgba(30,50,96,0.08)] ring-1 ring-[#e7eaf2] hover:bg-white md:size-8 md:rounded-full"
                )}
                nativeButton={false}
                render={
                  <Link
                    to={getWorkspaceSettingsPath(activeOrganization.slug)}
                  />
                }
              >
                <SettingsIcon />
                <span className="sr-only">Settings</span>
              </Button>
            ) : null}
          </header>

          <div
            className={cn(
              "no-scrollbar flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto"
            )}
          >
            {canViewTrialBanner ? (
              <TrialBanner billing={billing ?? null} trial={trial ?? null} />
            ) : null}
            {canInviteTeamMembers ? (
              <>
                <PastDueBillingNotice
                  billing={billing}
                  organizationId={
                    activeWorkspace?.type === "organization"
                      ? activeWorkspace.id
                      : null
                  }
                  locationId={
                    activeWorkspace?.type === "location"
                      ? activeWorkspace.id
                      : null
                  }
                />
              </>
            ) : null}
            {children ?? <ShellBody title={title} description={description} />}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export { DashboardShell }
