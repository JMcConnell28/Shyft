"use client"

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
} from "@/components/ui/dialog"
import { useStaffInviteLink } from "@/features/onboarding/hooks/use-staff-invite-link"

function SidebarInviteDialog({
  open,
  onOpenChange,
  scopeId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  scopeId: string
}) {
  const {
    activeInvite,
    copied,
    copyLink,
    defaults,
    error,
    inviteUrl,
    isCreating,
    isPreparing,
    replaceLink,
    retry,
  } = useStaffInviteLink(scopeId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] gap-5 rounded-[22px] border border-[#dce7fa] bg-white p-5 shadow-[0_22px_70px_rgba(17,34,78,0.14)] ring-0 sm:p-6">
        <DialogHeader className="flex-row items-start gap-3 pr-8">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4ff] text-[#1466ed]">
            <UserPlus2Icon className="size-5" />
          </span>
          <div className="space-y-1">
            <DialogTitle className="font-heading text-lg font-bold tracking-[-0.04em] text-[#11224e]">
              Invite staff
            </DialogTitle>
            <DialogDescription className="text-sm leading-5 text-[#5b6d8e]">
              Share a link to bring staff into your team.
            </DialogDescription>
          </div>
        </DialogHeader>

        {inviteUrl ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-[#d7e3f8] bg-[#f7faff] p-3.5">
              <p className="mb-1.5 text-xs font-semibold text-[#24395f]">
                Invite link
              </p>
              <p className="text-sm leading-5 break-all text-[#52678d]">
                {inviteUrl}
              </p>
            </div>
            <p className="text-xs text-[#657797]">
              Joins {activeInvite?.locationName ?? defaults?.locationName} as{" "}
              {activeInvite?.staffGroupName ?? defaults?.defaultStaffGroupName}.
            </p>
          </div>
        ) : isPreparing ? (
          <div
            role="status"
            className="flex min-h-24 items-center justify-center gap-2 text-sm text-[#657797]"
          >
            <LoaderCircleIcon className="size-4 animate-spin" />
            Preparing your link...
          </div>
        ) : error ? (
          <div
            role="alert"
            className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={retry}>
              Try again
            </Button>
          </div>
        ) : (
          <p className="rounded-xl border border-[#d7e3f8] bg-[#f7faff] p-4 text-sm text-[#52678d]">
            Add a location and Employee group to create an invite link.
          </p>
        )}

        {inviteUrl ? (
          <div className="space-y-3">
            <DialogFooter className="gap-2 border-0 bg-transparent p-0 sm:justify-between">
              <Button
                variant="outline"
                disabled={!defaults || isCreating}
                onClick={replaceLink}
                className="h-10 rounded-xl border-[#cbd9f1] px-4 font-semibold text-[#24395f]"
              >
                {isCreating ? (
                  <LoaderCircleIcon className="size-4 animate-spin" />
                ) : (
                  <RefreshCcwIcon className="size-4" />
                )}
                {isCreating ? "Creating..." : "New link"}
              </Button>
              <Button
                disabled={isCreating}
                onClick={() => void copyLink()}
                className="h-10 rounded-xl bg-[#1466ed] px-4 font-semibold text-white hover:bg-[#0757d7]"
              >
                <CopyIcon className="size-4" />
                {copied ? "Copied" : "Copy link"}
              </Button>
            </DialogFooter>
            <p className="text-center text-xs text-[#657797] sm:text-left">
              A new link turns off the current one.
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export { SidebarInviteDialog }
