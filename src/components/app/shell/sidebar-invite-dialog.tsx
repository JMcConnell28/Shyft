"use client"
import { CheckIcon, CopyIcon, LoaderCircleIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { InviteLocationSelector } from "@/features/onboarding/components/invite-location-selector"
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
  const invite = useStaffInviteLink(scopeId)
  const canShare = Boolean(invite.inviteUrl)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100dvh-2rem)] max-w-xl flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="relative shrink-0 gap-1 border-b px-4 py-4 pr-16 sm:px-5 sm:pr-16">
          <DialogTitle className="text-lg leading-6 font-semibold tracking-tight">
            Invite staff
          </DialogTitle>
          <DialogDescription>
            Share a link for staff to request access.
          </DialogDescription>
          <DialogClose
            render={
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute top-3 right-4 sm:right-5"
                aria-label="Close"
              />
            }
          >
            <XIcon aria-hidden="true" />
          </DialogClose>
        </DialogHeader>
        <div className="min-h-0 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {invite.isPreparing ? (
            <p role="status" className="text-sm text-muted-foreground">
              Loading invite options…
            </p>
          ) : !invite.error || invite.defaults ? (
            <InviteLocationSelector
              layout="grid"
              locations={invite.locations}
              selectedIds={invite.selectedIds}
              onChange={invite.setSelectedIds}
              disabled={invite.isCreating}
            />
          ) : null}
          {invite.error ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 p-3">
              <p role="alert" className="text-sm text-destructive">
                {invite.error}
              </p>
              <Button type="button" variant="secondary" onClick={invite.retry}>
                Reload options
              </Button>
            </div>
          ) : null}
        </div>
        {!invite.isPreparing && !invite.error ? (
          <DialogFooter className="shrink-0 flex-col gap-3 bg-muted/30 px-4 py-3 sm:flex-col sm:px-5">
            {invite.inviteUrl ? (
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <label
                    className="text-sm font-semibold"
                    htmlFor="sidebar-invite-url"
                  >
                    Invite link
                  </label>
                  <p className="min-w-0 text-xs wrap-anywhere text-muted-foreground">
                    Staff group · {invite.activeInvite?.staffGroupName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="sidebar-invite-url"
                    className="h-11 flex-1 rounded-lg bg-card px-3 text-base md:h-8 md:text-sm dark:bg-card"
                    readOnly
                    value={invite.inviteUrl}
                    onFocus={(event) => event.currentTarget.select()}
                  />
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => void invite.copyLink()}
                  >
                    {invite.copied ? (
                      <CheckIcon aria-hidden="true" />
                    ) : (
                      <CopyIcon aria-hidden="true" />
                    )}
                    {invite.copied ? "Copied" : "Copy link"}
                  </Button>
                </div>
              </div>
            ) : null}
            {!canShare && !invite.hasChanges && !invite.isCreating ? (
              <p role="status" className="text-sm text-muted-foreground">
                Checking invite link…
              </p>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                {invite.activeInvite ? (
                  <p className="min-w-0 flex-1 basis-40 text-xs text-muted-foreground">
                    The old link stops working. Submitted requests keep their
                    locations.
                  </p>
                ) : !invite.defaults ? (
                  <p className="text-xs text-muted-foreground">
                    A staff group is required to create a link.
                  </p>
                ) : null}
                <Button
                  type="button"
                  variant={canShare ? "secondary" : "primary"}
                  className="ml-auto"
                  disabled={!invite.defaults || invite.isCreating}
                  onClick={invite.replaceLink}
                >
                  {invite.isCreating ? (
                    <LoaderCircleIcon
                      aria-hidden="true"
                      className="animate-spin motion-reduce:animate-none"
                    />
                  ) : null}
                  {invite.isCreating
                    ? "Creating link…"
                    : invite.activeInvite
                      ? invite.hasChanges
                        ? "Update link"
                        : "Replace link"
                      : "Create link"}
                </Button>
              </div>
            )}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
export { SidebarInviteDialog }
