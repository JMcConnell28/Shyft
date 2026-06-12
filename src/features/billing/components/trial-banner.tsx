"use client"

import { AlertTriangleIcon } from "lucide-react"

import { CheckoutButton } from "@/features/billing/components/checkout-button"
import { TrialTestingControls } from "@/features/billing/components/trial-testing-controls"
import { hasPaidWorkspaceAccess } from "@/features/billing/utils/billing-access"
import type {
  WorkspaceBillingState,
  WorkspaceTrial,
} from "@/features/billing/types"
import { getTrialDisplayState } from "@/features/billing/utils/trial-state"

function TrialBanner({
  billing,
  trial,
}: {
  billing: WorkspaceBillingState | null
  trial: WorkspaceTrial | null
}) {
  const trialState = getTrialDisplayState(trial)

  if (!trialState) {
    return null
  }

  const hasOpenSubscription = hasPaidWorkspaceAccess(billing)
  const hasSavedPaymentMethod = billing?.hasSavedPaymentMethod ?? false

  if (
    !hasOpenSubscription &&
    !hasSavedPaymentMethod &&
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
              {hasSavedPaymentMethod && !hasOpenSubscription
                ? "Payment method saved."
                : hasOpenSubscription
                ? "Payment method saved."
                : trialState.isEndingSoon
                  ? `Your trial ends in ${trialState.daysRemaining} day${trialState.daysRemaining === 1 ? "" : "s"}.`
                  : `Trial active: ${trialState.daysRemaining} day${trialState.daysRemaining === 1 ? "" : "s"} remaining.`}
            </p>
            <p className="text-xs text-amber-900/80">
              {hasSavedPaymentMethod && !hasOpenSubscription
                ? "Your first payment will be taken when the trial ends."
                : hasOpenSubscription
                ? "Your subscription will start automatically when the trial ends."
                : "Add billing before the trial ends to keep rota access uninterrupted."}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <TrialTestingControls trial={trialState} />
          {!hasOpenSubscription && !hasSavedPaymentMethod ? (
            <CheckoutButton
              organizationId={trialState.organizationId}
              locationId={trialState.locationId}
            >
              Choose plan
            </CheckoutButton>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export { TrialBanner }
