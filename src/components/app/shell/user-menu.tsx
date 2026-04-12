import * as React from "react"
import { ChevronsUpDownIcon, LogOutIcon } from "lucide-react"

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
} from "@/components/ui/sidebar"

function UserMenu({
  isSigningOut,
  onSignOut,
  user,
}: {
  isSigningOut: boolean
  onSignOut: () => void
  user: {
    name: string
    email: string
  }
}) {
  const fallbackInitials = React.useMemo(() => {
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }, [user.name])

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
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg">
                {fallbackInitials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 overflow-hidden text-left text-xs leading-tight transition-[width,opacity] duration-200 ease-linear group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-[11px] text-sidebar-foreground/70">
                {user.email}
              </span>
            </div>
            <div className="ml-auto flex w-4 items-center justify-center overflow-hidden transition-[width,opacity] duration-200 ease-linear group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
              <ChevronsUpDownIcon className="size-4" />
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
