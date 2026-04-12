import * as React from "react"
import { Link } from "@tanstack/react-router"
import { BellIcon } from "lucide-react"
import { TooltipProvider } from "../ui/tooltip"
import type { OrganizationSummary } from "@/lib/onboarding"
import type { OrganizationAppRouteKey } from "@/lib/organization-paths"
import { authClient } from "@/lib/auth-client"
import { AppSidebar } from "@/components/app/shell/app-sidebar"
import { DevRoleMenu } from "@/components/app/dev-role-menu"
import { ShellBody } from "@/components/app/shell/shell-body"
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
} from "@/components/ui/sidebar"

function DashboardShell({
  routeKey,
  title,
  description,
  children,
  hasUnreadRotaUpdates,
  user,
  organizations,
  activeOrganization,
}: {
  routeKey: OrganizationAppRouteKey
  title: string
  description: string
  children?: React.ReactNode
  hasUnreadRotaUpdates?: boolean
  user: {
    name: string
    email: string
  }
  organizations: Array<OrganizationSummary>
  activeOrganization: OrganizationSummary | null
}) {
  const [isSigningOut, setIsSigningOut] = React.useState(false)

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
          user={user}
          organizations={organizations}
          activeOrganization={activeOrganization}
        />
        <SidebarInset className="min-h-0 overflow-hidden">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            {/* <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-8 my-2" /> */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  {activeOrganization ? (
                    <BreadcrumbLink
                      render={
                        <Link
                          to="/o/$orgSlug/dashboard"
                          params={{ orgSlug: activeOrganization.slug }}
                        />
                      }
                    >
                      {activeOrganization.name}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbLink render={<Link to="/dashboard" />}>
                      Shyft
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          <Button variant="ghost" size="icon-sm" className="ml-auto">
            <BellIcon />
            <span className="sr-only">Notifications</span>
          </Button>
          {import.meta.env.DEV && activeOrganization ? (
            <DevRoleMenu activeOrganization={activeOrganization} />
          ) : null}
        </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {children ?? <ShellBody title={title} description={description} />}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export { DashboardShell }
