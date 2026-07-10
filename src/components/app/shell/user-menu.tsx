import * as React from "react"
import { ChevronsUpDownIcon, LogOutIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"

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
  isSigningOut,
  onSignOut,
  accountHref,
  user,
}: {
  isSigningOut: boolean
  onSignOut: () => void
  accountHref: string
  user: {
    name: string
    email: string
  }
}) {
  const { setOpenMobile } = useSidebar()
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
            className="min-w-56 rounded-lg"
            side="top"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-xs">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {fallbackInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={
                  <Link to={accountHref} onClick={() => setOpenMobile(false)} />
                }
              >
                Account
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isSigningOut}
                onClick={() => {
                  onSignOut()
                }}
              >
                <LogOutIcon />
                {isSigningOut ? "Signing out..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export { UserMenu }
