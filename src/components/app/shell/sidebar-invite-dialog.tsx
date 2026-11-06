"use client"
import { CopyIcon, LoaderCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-[480px] gap-5 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite staff</DialogTitle>
          <DialogDescription>
            Choose where employees will be active after an owner or admin
            approves their organization join request.
          </DialogDescription>
        </DialogHeader>
        {invite.isPreparing ? (
          <p role="status" className="text-sm text-muted-foreground">
            Loading invite options...
          </p>
        ) : (
          <>
            <InviteLocationSelector
              locations={invite.locations}
              selectedIds={invite.selectedIds}
              onChange={invite.setSelectedIds}
              disabled={invite.isCreating}
            />
            {invite.inviteUrl ? (
              <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                <p className="text-xs font-semibold">Current invite link</p>
                <p className="text-sm break-all text-muted-foreground">
                  {invite.inviteUrl}
                </p>
                <p className="text-xs text-muted-foreground">
                  Staff group: {invite.activeInvite?.staffGroupName}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {invite.hasChanges && invite.activeInvite
                  ? "Create an updated link to apply this location selection."
                  : "Create a link with the locations selected above."}
              </p>
            )}
          </>
        )}
        {invite.error && (
          <div role="alert" className="space-y-2 text-sm text-destructive">
            <p>{invite.error}</p>
            <Button variant="outline" onClick={invite.retry}>
              Reload options
            </Button>
          </div>
        )}
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            className="min-h-11"
            variant="outline"
            disabled={
              !invite.defaults || invite.isPreparing || invite.isCreating
            }
            onClick={invite.replaceLink}
          >
            {invite.isCreating && (
              <LoaderCircleIcon className="size-4 animate-spin" />
            )}
            {invite.isCreating
              ? "Creating..."
              : invite.activeInvite
                ? invite.hasChanges
                  ? "Update link"
                  : "New link"
                : "Create link"}
          </Button>
          <Button
            className="min-h-11"
            disabled={!invite.inviteUrl || invite.isCreating}
            onClick={() => void invite.copyLink()}
          >
            <CopyIcon className="size-4" />
            {invite.copied ? "Copied" : "Copy link"}
          </Button>
        </DialogFooter>
        <p className="text-xs text-muted-foreground">
          Creating a new link turns off the previous link. Requests already
          submitted keep their original locations.
        </p>
      </DialogContent>
    </Dialog>
  )
}
export { SidebarInviteDialog }
