import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"

import type { OrganizationSummary } from "@/features/onboarding/types"
import { useOrganizationSwitch } from "@/features/navigation/hooks/use-organization-switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

function UserMenu({
  accountHref,
  organizations,
  activeOrganization,
  user,
}: {
  accountHref: string
  organizations: Array<OrganizationSummary>
  activeOrganization: OrganizationSummary | null
  user: {
    name: string
    email: string
  }
}) {
  const { setOpenMobile } = useSidebar()
  const { switchingId, switchOrganization } =
    useOrganizationSwitch(organizations)
  const fallbackInitials = React.useMemo(() => {
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }, [user.name])

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:p-2! group-data-[collapsible=icon]:shadow-none data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground max-md:h-16 max-md:gap-3 max-md:rounded-[18px] max-md:border-[#e2e7f2] max-md:bg-white max-md:px-3 max-md:shadow-[0_12px_30px_rgba(30,50,96,0.08)] max-md:data-[state=open]:bg-white"
              />
            }
          >
            <span className="hidden text-[11px] leading-none font-semibold text-[#071a54] group-data-[collapsible=icon]:block">
              {fallbackInitials}
            </span>
            <Avatar className="size-5 rounded-lg group-data-[collapsible=icon]:hidden max-md:size-9 max-md:rounded-full max-md:bg-[#eef3ff]">
              <AvatarFallback className="rounded-lg text-[10px] text-[#071a54] max-md:rounded-full max-md:text-base max-md:font-extrabold">
                {fallbackInitials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 overflow-hidden text-left text-xs leading-tight transition-[width,opacity] duration-200 ease-linear group-data-[collapsible=icon]:hidden max-md:gap-1">
              <span className="max-md:text-md truncate font-medium max-md:font-extrabold max-md:tracking-[-0.03em] max-md:text-[#071a54]">
                {user.name}
              </span>
              <span className="truncate text-xs text-sidebar-foreground/70 max-md:text-xs max-md:font-medium max-md:text-[#5d6b94]">
                {user.email}
              </span>
            </div>
            <div className="ml-auto flex w-4 items-center justify-center overflow-hidden text-[#64708f] transition-[width,opacity] duration-200 ease-linear group-data-[collapsible=icon]:hidden max-md:w-5">
              <ChevronsUpDownIcon className="size-4 max-md:size-5" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-64 rounded-xl border border-[#dfe4ef] bg-white p-1.5 text-[#10204b] shadow-[0_12px_32px_rgba(30,50,96,0.12)] ring-0"
            side="top"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex min-w-0 items-center gap-3 px-2 py-2 text-left">
                  <Avatar className="size-9 rounded-full bg-[#eef3ff]">
                    <AvatarFallback className="rounded-full bg-[#eef3ff] text-xs font-bold text-[#236cff]">
                      {fallbackInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid min-w-0 flex-1 text-left leading-tight">
                    <span className="truncate text-[13px] font-bold text-[#10204b]">
                      {user.name}
                    </span>
                    <span className="mt-1 truncate text-[11px] font-medium text-[#7180a2]">
                      {user.email}
                    </span>
                    <span className="mt-1 truncate text-[11px] font-medium text-[#53617f]">
                      <span className="hidden md:inline">Viewing </span>
                      {activeOrganization?.name ?? "no organization"}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Switch organization</DropdownMenuLabel>
              {organizations.map((organization) => (
                <DropdownMenuItem
                  key={organization.id}
                  disabled={
                    Boolean(switchingId) ||
                    organization.id === activeOrganization?.id
                  }
                  onClick={() => void switchOrganization(organization.id)}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {organization.name}
                  </span>
                  {organization.id === activeOrganization?.id ? (
                    <CheckIcon aria-label="Current organization" />
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="min-h-9 rounded-lg px-3 text-[13px] font-semibold text-[#53617f] transition-colors focus:bg-[#f5f7fb] focus:text-[#10204b]"
                render={
                  <Link to={accountHref} onClick={() => setOpenMobile(false)} />
                }
              >
                Account settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export { UserMenu }
