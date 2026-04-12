import * as React from "react"
import { useServerFn } from "@tanstack/react-start"
import { ChevronsUpDownIcon } from "lucide-react"

import type { OrganizationSummary } from "@/features/onboarding/types"
import { activateOrganization } from "@/lib/onboarding"
import { getOrganizationAppPath } from "@/lib/organization-paths"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type WorkspaceRouteKey = "dashboard" | "rota"


function WorkspaceSwitcher({
  organizations,
  activeOrganization,
  routeKey,
}: {
  organizations: Array<OrganizationSummary>
  activeOrganization: OrganizationSummary | null
  routeKey: WorkspaceRouteKey
}) {
  const activateOrganizationFn = useServerFn(activateOrganization)
  const [isSwitchingOrganization, setIsSwitchingOrganization] =
    React.useState(false)

  async function handleOrganizationSwitch(organizationId: string) {
    if (organizationId === activeOrganization?.id) {
      return
    }

    const nextOrganization =
      organizations.find((organization) => organization.id === organizationId) ??
      null

    setIsSwitchingOrganization(true)
    await activateOrganizationFn({
      data: {
        organizationId,
      },
    })
    window.location.href = nextOrganization
      ? getOrganizationAppPath(nextOrganization.slug, routeKey)
      : "/dashboard"
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <span className="text-sm font-semibold">S</span>
            </div>
            <div className="grid flex-1 overflow-hidden text-left text-xs leading-tight transition-[width,opacity] duration-200 ease-linear group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
              <span className="truncate font-medium">
                {activeOrganization?.name ?? "Shyft"}
              </span>
              <span className="truncate text-[11px] text-sidebar-foreground/70">
                {activeOrganization?.slug ?? "Choose a workspace"}
              </span>
            </div>
            <div className="ml-auto flex w-4 items-center justify-center overflow-hidden transition-[width,opacity] duration-200 ease-linear group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
              <ChevronsUpDownIcon className="size-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side="bottom"
            align="start"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Workspace</DropdownMenuLabel>
              {organizations.map((organization) => (
                <DropdownMenuItem
                  key={organization.id}
                  disabled={isSwitchingOrganization}
                  onClick={() => {
                    void handleOrganizationSwitch(organization.id)
                  }}
                >
                  {organization.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export { WorkspaceSwitcher }
