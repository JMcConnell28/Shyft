"use client"

import { useState } from "react"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { BillingSettingRow } from "@/features/billing/components/billing-setting-row"
import { useCancelOrganizationSubscription } from "@/features/billing/hooks/use-cancel-organization-subscription"
import { formatBillingDate } from "@/features/billing/utils/billing-settings"
import { getErrorMessage } from "@/lib/errors"

function SubscriptionCancellationRow({
  organizationId,
  endsAt,
}: {
  organizationId: string
  endsAt?: string | null
}) {
  const [open, setOpen] = useState(false)
  const cancellation = useCancelOrganizationSubscription(organizationId)
  const cancellationDate = cancellation.data?.endsAt ?? endsAt
  const isScheduled = Boolean(cancellationDate || cancellation.isSuccess)

  return (
    <BillingSettingRow
      title="Automatic renewal"
      description={
        cancellationDate
          ? `Subscription ends on ${formatBillingDate(cancellationDate)}.`
          : isScheduled
            ? "Automatic renewal is off."
            : "Cancel renewal at the end of your current billing period."
      }
    >
      {isScheduled ? (
        <span
          role="status"
          className="text-xs font-medium text-muted-foreground"
        >
          Renewal off
        </span>
      ) : (
        <AlertDialog
          open={open}
          onOpenChange={(nextOpen, details) => {
            if (cancellation.isPending) {
              details.cancel()
              return
            }
            if (nextOpen) cancellation.reset()
            setOpen(nextOpen)
          }}
        >
          <AlertDialogTrigger render={<Button variant="outline" size="lg" />}>
            Cancel subscription
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
              <AlertDialogDescription>
                Your plan will stop renewing. Access continues until the end of
                your current subscription period. Outstanding fees and final
                usage may still be invoiced.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {cancellation.isError && (
              <div role="alert">
                <FormErrorMessage
                  message={getErrorMessage(
                    cancellation.error,
                    "We could not cancel the subscription. Please try again."
                  )}
                />
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel size="lg" disabled={cancellation.isPending}>
                Keep subscription
              </AlertDialogCancel>
              <AlertDialogAction
                variant="danger"
                disabled={cancellation.isPending}
                onClick={() =>
                  cancellation.mutate(undefined, {
                    onSuccess: () => setOpen(false),
                  })
                }
              >
                {cancellation.isPending ? "Cancelling…" : "Cancel subscription"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </BillingSettingRow>
  )
}

export { SubscriptionCancellationRow }
