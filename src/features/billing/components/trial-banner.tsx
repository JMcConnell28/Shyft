"use client"

import * as React from "react"
import { AlertTriangleIcon, XIcon } from "lucide-react"

import type {
  WorkspaceBillingState,
  WorkspaceTrial,
} from "@/features/billing/types"
import { CheckoutButton } from "@/features/billing/components/checkout-button"
import { hasPaidWorkspaceAccess } from "@/features/billing/utils/billing-access"
import { getTrialDisplayState } from "@/features/billing/utils/trial-state"

function TrialBanner({
  billing,
  trial,
}: {
  billing: WorkspaceBillingState | null
  trial: WorkspaceTrial | null
}) {
  const [isDismissed, setIsDismissed] = React.useState(false)
  const trialState = getTrialDisplayState(trial)

  if (!trialState || isDismissed) {
    return null
  }

  const hasOpenSubscription = hasPaidWorkspaceAccess(billing)
  const hasSavedPaymentMethod = billing?.hasSavedPaymentMethod ?? false
  const isExpiredWithoutPaidAccess = trialState.isExpired && !hasOpenSubscription

  if (hasSavedPaymentMethod && !isExpiredWithoutPaidAccess) {
    return null
  }

  if (
    !hasOpenSubscription &&
    !hasSavedPaymentMethod &&
    !isExpiredWithoutPaidAccess &&
    !trialState.isEndingSoon &&
    !import.meta.env.DEV
  ) {
    return null
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isExpiredWithoutPaidAccess
                ? "Your trial has expired."
                : hasSavedPaymentMethod && !hasOpenSubscription
                ? "Payment method saved."
                : hasOpenSubscription
                  ? "Payment method saved."
                : trialState.isEndingSoon
                  ? `Your trial ends in ${trialState.daysRemaining} day${trialState.daysRemaining === 1 ? "" : "s"}.`
                  : `Trial active: ${trialState.daysRemaining} day${trialState.daysRemaining === 1 ? "" : "s"} remaining.`}
            </p>
            <p className="text-xs text-amber-900/80">
              {isExpiredWithoutPaidAccess
                ? "Choose a plan to restore rota editing, publishing, and workspace changes."
                : hasSavedPaymentMethod && !hasOpenSubscription
                ? "Your first payment will be taken when the trial ends."
                : hasOpenSubscription
                  ? "Your subscription will start automatically when the trial ends."
                : "Add billing before the trial ends to keep rota access uninterrupted."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:flex-row sm:items-center">
          {!hasOpenSubscription &&
          (!hasSavedPaymentMethod || isExpiredWithoutPaidAccess) ? (
            <CheckoutButton
              organizationId={trialState.organizationId}
              locationId={trialState.locationId}
            >
              {isExpiredWithoutPaidAccess
                ? "Reactivate workspace"
                : "Add payment method"}
            </CheckoutButton>
          ) : null}
          <button
            type="button"
            aria-label="Dismiss trial banner"
            title="Dismiss trial banner"
            onClick={() => {
              setIsDismissed(true)
            }}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-amber-300/80 text-amber-900 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export { TrialBanner }
