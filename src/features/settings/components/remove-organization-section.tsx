"use client"

import { Link } from "@tanstack/react-router"
import { Trash2Icon } from "lucide-react"
import { useId, useState } from "react"

import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { useRemoveOrganization } from "@/features/settings/hooks/use-remove-organization"
import { getErrorMessage } from "@/lib/errors"

function RemoveOrganizationSection({
  organizationId,
  organizationName,
  workspaceSlug,
}: {
  organizationId: string
  organizationName: string
  workspaceSlug: string
}) {
  const fieldId = useId()
  const [open, setOpen] = useState(false)
  const [confirmationName, setConfirmationName] = useState("")
  const removal = useRemoveOrganization(organizationId)
  const confirmed = confirmationName.trim() === organizationName.trim()
  const isRemoving = removal.isPending || removal.isSuccess

  return (
    <SettingsSection
      title="Remove organisation"
      icon={Trash2Icon}
      description="Permanently close this workplace."
    >
      <div className="flex flex-col items-start gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-muted-foreground">
          Download any records you need first. If you have a subscription,{" "}
          <Link
            to="/app/$workspaceSlug/settings/billing"
            params={{ workspaceSlug }}
            className="underline"
          >
            cancel it in Billing
          </Link>{" "}
          and wait for it to end before removing the organisation.
        </p>
        <AlertDialog
          open={open}
          onOpenChange={(nextOpen, details) => {
            if (isRemoving) {
              details.cancel()
              return
            }
            if (nextOpen) {
              setConfirmationName("")
              removal.reset()
            }
            setOpen(nextOpen)
          }}
        >
          <AlertDialogTrigger render={<Button variant="danger" />}>
            Remove organisation
          </AlertDialogTrigger>
          <AlertDialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="break-all">
                Remove {organizationName}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes this organisation’s live workplace
                data, including locations, rotas and timesheets, and removes
                team access.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault()
                if (confirmed && !isRemoving)
                  removal.mutate(confirmationName.trim())
              }}
            >
              <div className="space-y-2">
                <Label htmlFor={fieldId}>
                  Type the organisation name to confirm
                </Label>
                <Input
                  id={fieldId}
                  autoComplete="off"
                  readOnly={isRemoving}
                  value={confirmationName}
                  onChange={(event) => setConfirmationName(event.target.value)}
                />
              </div>
              {removal.isError && (
                <div role="alert">
                  <FormErrorMessage
                    message={getErrorMessage(
                      removal.error,
                      "We could not remove this organisation. Please try again."
                    )}
                  />
                </div>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel
                  type="button"
                  size="lg"
                  disabled={isRemoving}
                >
                  Keep organisation
                </AlertDialogCancel>
                <FormSubmitButton
                  variant="danger"
                  isSubmitting={isRemoving}
                  submittingText="Removing…"
                  disabled={!confirmed}
                >
                  Remove organisation
                </FormSubmitButton>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SettingsSection>
  )
}

export { RemoveOrganizationSection }
