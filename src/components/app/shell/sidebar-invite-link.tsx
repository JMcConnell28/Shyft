"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import {
  CopyIcon,
  LoaderCircleIcon,
  RefreshCcwIcon,
  UserPlus2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  createStaffInviteLink,
  getActiveStaffInviteLink,
} from "@/lib/onboarding"
import { getErrorMessage } from "@/lib/errors"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function SidebarInviteLink() {
  const getActiveStaffInviteLinkFn = useServerFn(getActiveStaffInviteLink)
  const createStaffInviteLinkFn = useServerFn(createStaffInviteLink)
  const [open, setOpen] = React.useState(false)
  const [inviteUrl, setInviteUrl] = React.useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [copyState, setCopyState] = React.useState<"idle" | "copied">("idle")
  const inviteQuery = useQuery({
    queryKey: ["sidebar-invite-link"],
    queryFn: () => getActiveStaffInviteLinkFn(),
    enabled: open,
  })

  React.useEffect(() => {
    if (inviteQuery.data?.activeInvite?.joinUrl) {
      setInviteUrl(inviteQuery.data.activeInvite.joinUrl)
      return
    }

    setInviteUrl(null)
  }, [inviteQuery.data])

  async function handleCopyInviteLink() {
    if (!inviteUrl || typeof navigator === "undefined") {
      return
    }

    await navigator.clipboard.writeText(inviteUrl)
    setCopyState("copied")
    showSuccessToast("Invite link copied.")
    window.setTimeout(() => {
      setCopyState("idle")
    }, 1800)
  }

  async function handleRefreshInviteLink() {
    const defaults = inviteQuery.data?.defaults

    if (!defaults) {
      showErrorToast("Add a location and the Employee fallback group first.", {
        fallbackMessage: "We could not create a fresh invite link.",
      })
      return
    }

    setIsRefreshing(true)

    try {
      const result = await createStaffInviteLinkFn({
        data: {
          locationId: defaults.locationId,
          defaultStaffGroupId: defaults.defaultStaffGroupId,
        },
      })

      setInviteUrl(result.joinUrl)
      showSuccessToast("Fresh invite link created.")
      await inviteQuery.refetch()
    } catch (error) {
      showErrorToast(error, {
        fallbackMessage: "We could not create a fresh invite link.",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <SidebarMenu className="group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:items-center">
        <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <DialogTrigger
            render={
              <SidebarMenuButton
                size="lg"
                tooltip="Invite staff"
                className="h-auto cursor-pointer items-center gap-3 rounded-xl border border-transparent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:p-2! group-data-[collapsible=icon]:shadow-none max-md:rounded-[18px] max-md:border-[#cbd8ff] max-md:bg-[#f9fbff] max-md:px-3 max-md:py-2 max-md:text-[#071a54] max-md:shadow-[0_10px_24px_rgba(30,50,96,0.07)] max-md:data-[state=open]:bg-[#f3f6ff]"
              />
            }
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0069ff] group-data-[collapsible=icon]:size-4 group-data-[collapsible=icon]:rounded-none group-data-[collapsible=icon]:bg-transparent max-md:size-12 max-md:rounded-2xl">
              <UserPlus2Icon className="size-5 group-data-[collapsible=icon]:size-4 max-md:size-7" />
            </span>
            <span className="min-w-0 flex-1 transition-[width,opacity] duration-200 ease-linear group-data-[collapsible=icon]:hidden">
              <span className="block text-sm font-bold tracking-[-0.02em] max-md:text-[18px]">
                Invites
              </span>
              <span className="mt-0.5 hidden text-xs leading-snug font-medium text-wrap text-[#5d6b94] max-md:block">
                Invite your team with a reusable link.
              </span>
            </span>
          </DialogTrigger>
        </SidebarMenuItem>
      </SidebarMenu>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Staff invite link</DialogTitle>
          <DialogDescription>
            Reuse the current invite link or generate a fresh one for staff.
          </DialogDescription>
        </DialogHeader>

        {inviteQuery.isPending ? (
          <div className="flex min-h-28 items-center justify-center text-sm text-muted-foreground">
            <LoaderCircleIcon className="mr-2 size-4 animate-spin" />
            Loading invite link...
          </div>
        ) : inviteQuery.isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {getErrorMessage(
              inviteQuery.error,
              "We could not load the invite link."
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {inviteUrl ? (
              <div className="space-y-3">
                <div className="space-y-1 rounded-xl border border-border/70 bg-muted/15 px-4 py-3">
                  <p className="text-xs font-medium text-foreground">
                    Current reusable link
                  </p>
                  <p className="text-sm break-all text-muted-foreground">
                    {inviteUrl}
                  </p>
                </div>
                {inviteQuery.data.activeInvite ? (
                  <div className="text-xs text-muted-foreground">
                    {inviteQuery.data.activeInvite.locationName} ·{" "}
                    {inviteQuery.data.activeInvite.staffGroupName}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
                No active invite link yet. Generate one when you are ready to
                onboard staff.
              </div>
            )}

            {inviteQuery.data.defaults ? (
              <div className="text-xs text-muted-foreground">
                Fresh links will use {inviteQuery.data.defaults.locationName}{" "}
                and {inviteQuery.data.defaults.defaultStaffGroupName} by
                default.
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="pill"
            disabled={!inviteUrl || inviteQuery.isPending}
            onClick={() => {
              void handleCopyInviteLink()
            }}
          >
            <CopyIcon data-icon="inline-start" />
            {copyState === "copied" ? "Copied" : "Copy link"}
          </Button>
          <Button
            variant="warm"
            disabled={
              isRefreshing ||
              inviteQuery.isPending ||
              !inviteQuery.data?.defaults
            }
            onClick={() => {
              void handleRefreshInviteLink()
            }}
          >
            {isRefreshing ? (
              <LoaderCircleIcon
                data-icon="inline-start"
                className="animate-spin"
              />
            ) : (
              <RefreshCcwIcon data-icon="inline-start" />
            )}
            Fresh link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { SidebarInviteLink }
