import * as React from "react"
import { Link } from "@tanstack/react-router"
import { ArrowLeftIcon, SettingsIcon } from "lucide-react"
import { TooltipProvider } from "../ui/tooltip"
import type { OrganizationSummary, WorkspaceSummary } from "@/lib/onboarding"
import {
  getWorkspaceDashboardPath,
  getWorkspaceSettingsPath,
  type OrganizationAppRouteKey,
} from "@/lib/organization-paths"
import { authClient } from "@/lib/auth-client"
import { AppSidebar } from "@/components/app/shell/app-sidebar"
import { DevRoleMenu } from "@/components/app/dev-role-menu"
import { ShellBody } from "@/components/app/shell/shell-body"
import { PastDueBillingNotice } from "@/features/billing/components/past-due-billing-notice"
import type {
  WorkspaceBillingState,
  WorkspaceTrial,
} from "@/features/billing/types"
import type { OrganizationCapabilities } from "@/lib/auth/get-org-capabilities"
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

function DashboardShell({
  routeKey,
  title,
  description,
  backLink,
  children,
  hasUnreadRotaUpdates,
  canInviteTeamMembers,
  user,
  organizations,
  activeOrganization,
  workspaces = [],
  activeWorkspace,
  billing,
  capabilities,
}: {
  routeKey: OrganizationAppRouteKey
  title: string
  description: string
  backLink?: {
    href: string
    label: string
  }
  children?: React.ReactNode
  hasUnreadRotaUpdates?: boolean
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
          canInviteTeamMembers={canInviteTeamMembers}
          user={user}
          organizations={organizations}
          activeOrganization={activeOrganization}
          workspaces={workspaces}
          activeWorkspace={resolvedActiveWorkspace}
          capabilities={capabilities}
        />
        <SidebarInset className="min-h-0 overflow-hidden">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1 md:hidden" />
            {backLink ? (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground"
                nativeButton={false}
                render={<Link to={backLink.href} />}
              >
                <ArrowLeftIcon className="size-3.5" />
                <span className="hidden sm:inline">{backLink.label}</span>
                <span className="sm:hidden">Back</span>
              </Button>
            ) : null}
            <Breadcrumb>
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
                          to={getWorkspaceDashboardPath(activeOrganization.slug)}
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
            {capabilities.canManageSettings && activeWorkspace?.type === "location" ? (
              <Button
                variant="pill"
                size="icon"
                className="ml-auto"
                nativeButton={false}
                render={
                  <Link to={getWorkspaceSettingsPath(activeWorkspace.slug)} />
                }
              >
                <SettingsIcon />
                <span className="sr-only">Settings</span>
              </Button>
            ) : capabilities.canManageSettings && activeOrganization ? (
              <Button
                variant="pill"
                size="icon"
                className="ml-auto"
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
            {import.meta.env.DEV && activeOrganization ? (
              <DevRoleMenu activeOrganization={activeOrganization} />
            ) : null}
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {canInviteTeamMembers ? (
              <PastDueBillingNotice
                billing={billing}
                organizationId={
                  activeWorkspace?.type === "organization"
                    ? activeWorkspace.id
                    : null
                }
                locationId={
                  activeWorkspace?.type === "location" ? activeWorkspace.id : null
                }
              />
            ) : null}
            {children ?? <ShellBody title={title} description={description} />}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export { DashboardShell }
