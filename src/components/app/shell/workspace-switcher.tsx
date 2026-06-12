import * as React from "react"
import { useServerFn } from "@tanstack/react-start"
import { ChevronsUpDownIcon } from "lucide-react"

import type {
  OrganizationSummary,
  WorkspaceSummary,
} from "@/features/onboarding/types"
import { activateOrganization } from "@/lib/onboarding"
import {
  getWorkspaceAppPath,
  type OrganizationAppRouteKey,
} from "@/lib/organization-paths"
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

function WorkspaceSwitcher({
  organizations,
  activeOrganization,
  workspaces,
  activeWorkspace,
  routeKey,
}: {
  organizations: Array<OrganizationSummary>
  activeOrganization: OrganizationSummary | null
  workspaces: Array<WorkspaceSummary>
  activeWorkspace: WorkspaceSummary | null
  routeKey: OrganizationAppRouteKey
}) {
  const activateOrganizationFn = useServerFn(activateOrganization)
  const [isSwitchingOrganization, setIsSwitchingOrganization] =
    React.useState(false)

  async function handleOrganizationSwitch(organizationId: string) {
    if (organizationId === activeOrganization?.id) {
      return
    }

    const nextOrganization =
      organizations.find(
        (organization) => organization.id === organizationId
      ) ?? null

    setIsSwitchingOrganization(true)
    await activateOrganizationFn({
      data: {
        organizationId,
      },
    })
    window.location.href = nextOrganization
      ? getWorkspaceAppPath(nextOrganization.slug, routeKey)
      : "/dashboard"
  }

  function handleWorkspaceSwitch(workspace: WorkspaceSummary) {
    if (workspace.type === "location") {
      window.location.href = getWorkspaceAppPath(workspace.slug, routeKey)
      return
    }

    void handleOrganizationSwitch(workspace.id)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg p-1">
              <img
                src="/brand/rocketrota-logo.png"
                alt="RocketRota"
                className="size-full object-contain"
              />
            </div>
            <div className="grid flex-1 overflow-hidden text-left text-xs leading-tight transition-[width,opacity] duration-200 ease-linear group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
              <span className="truncate font-medium">
                {activeWorkspace?.name ?? activeOrganization?.name ?? "RocketRota"}
              </span>
              <span className="truncate text-[11px] text-sidebar-foreground/70">
                {activeWorkspace?.slug ?? activeOrganization?.slug ?? "Choose a workspace"}
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
              {workspaces.length > 0 ? workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={`${workspace.type}:${workspace.id}`}
                  disabled={isSwitchingOrganization}
                  onClick={() => {
                    handleWorkspaceSwitch(workspace)
                  }}
                >
                  {workspace.name}
                </DropdownMenuItem>
              )) : organizations.map((organization) => (
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
