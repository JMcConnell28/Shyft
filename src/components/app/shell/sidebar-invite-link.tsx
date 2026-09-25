"use client"

import { UserPlus2Icon } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

function SidebarInviteLink({ onOpen }: { onOpen: () => void }) {
  return (
    <SidebarMenu className="group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <SidebarMenuButton
          size="lg"
          tooltip="Invite staff"
          onClick={onOpen}
          className="h-auto cursor-pointer items-center gap-3 rounded-xl border border-transparent group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:p-2! group-data-[collapsible=icon]:shadow-none max-md:rounded-[18px] max-md:border-[#cbd8ff] max-md:bg-[#f9fbff] max-md:px-3 max-md:py-2 max-md:text-[#071a54] max-md:shadow-[0_10px_24px_rgba(30,50,96,0.07)]"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0069ff] group-data-[collapsible=icon]:size-4 group-data-[collapsible=icon]:rounded-none group-data-[collapsible=icon]:bg-transparent max-md:size-12 max-md:rounded-2xl">
            <UserPlus2Icon className="size-5 group-data-[collapsible=icon]:size-4 max-md:size-7" />
          </span>
          <span className="min-w-0 flex-1 transition-[width,opacity] duration-200 ease-linear group-data-[collapsible=icon]:hidden">
            <span className="block text-sm font-bold tracking-[-0.02em] max-md:text-[18px]">
              Invites
            </span>
            <span className="mt-0.5 hidden text-xs leading-snug font-medium text-wrap text-[#5d6b94] max-md:block">
              Share a link with your team.
            </span>
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export { SidebarInviteLink }
