"use client"

import { AlertTriangleIcon, Clock3Icon, XIcon } from "lucide-react"

import type {
  WorkspaceBillingState,
  WorkspaceTrial,
} from "@/features/billing/types"
import { CheckoutButton } from "@/features/billing/components/checkout-button"
import { hasPaidWorkspaceAccess } from "@/features/billing/utils/billing-access"
import { getTrialDisplayState } from "@/features/billing/utils/trial-state"
import { cn } from "@/lib/utils"

type TrialBannerVariant = "header" | "sidebar"

function TrialBanner({
  billing,
  className,
  isDismissed,
  onDismiss,
  trial,
  variant,
}: {
  billing: WorkspaceBillingState | null
  className?: string
  isDismissed: boolean
  onDismiss: () => void
  trial: WorkspaceTrial | null
  variant: TrialBannerVariant
}) {
  const trialState = getTrialDisplayState(trial)

  if (!trialState || (variant === "header" && isDismissed)) {
    return null
  }

  const hasOpenSubscription = hasPaidWorkspaceAccess(billing)
  const hasSavedPaymentMethod = billing?.hasSavedPaymentMethod ?? false
  const isExpiredWithoutPaidAccess =
    trialState.isExpired && !hasOpenSubscription

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

  const title = isExpiredWithoutPaidAccess
    ? "Your trial has expired."
    : hasSavedPaymentMethod && !hasOpenSubscription
      ? "Payment method saved."
      : hasOpenSubscription
        ? "Payment method saved."
        : trialState.isEndingSoon
          ? `Trial ends in ${trialState.daysRemaining} day${trialState.daysRemaining === 1 ? "" : "s"}.`
          : `${trialState.daysRemaining} day${trialState.daysRemaining === 1 ? "" : "s"} left in trial.`
  const description = isExpiredWithoutPaidAccess
    ? "Choose a plan to restore rota editing, publishing, and workspace changes."
    : hasSavedPaymentMethod && !hasOpenSubscription
      ? "Your first payment will be taken when the trial ends."
      : hasOpenSubscription
        ? "Your subscription will start automatically when the trial ends."
        : "Add billing before the trial ends to keep rota access uninterrupted."
  const checkoutLabel = isExpiredWithoutPaidAccess
    ? "Reactivate workspace"
    : "Add payment method"
  const showCheckout =
    !hasOpenSubscription &&
    (!hasSavedPaymentMethod || isExpiredWithoutPaidAccess)

  if (variant === "header") {
    return (
      <div
        className={cn(
          "hidden h-8 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2 text-amber-950 md:flex",
          className
        )}
      >
        <AlertTriangleIcon className="size-3.5 shrink-0" />
        <span className="max-w-52 truncate text-xs font-medium">{title}</span>
        {showCheckout ? (
          <CheckoutButton
            organizationId={trialState.organizationId}
            locationId={trialState.locationId}
            className="h-6 px-2 text-[11px]"
          >
            {checkoutLabel}
          </CheckoutButton>
        ) : null}
        <button
          type="button"
          aria-label="Dismiss trial banner"
          title="Dismiss trial banner"
          onClick={onDismiss}
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-amber-900 transition-colors hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
        >
          <XIcon className="size-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "mx-4 rounded-[18px] border border-[#cbd8ff] bg-[#f9fbff] px-3 py-3 text-[#071a54] shadow-[0_10px_24px_rgba(30,50,96,0.07)] md:hidden",
        className
      )}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef3ff] text-[#0069ff]">
            <Clock3Icon className="size-7" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold tracking-[-0.02em]">{title}</p>
            <p className="mt-0.5 text-xs leading-snug font-medium text-[#5d6b94]">
              {description}
            </p>
          </div>
        </div>
        {showCheckout ? (
          <CheckoutButton
            organizationId={trialState.organizationId}
            locationId={trialState.locationId}
            className="h-8 w-full rounded-lg bg-[#3975b9] font-semibold text-white hover:bg-[#2f67a6]"
          >
            {checkoutLabel}
          </CheckoutButton>
        ) : null}
      </div>
    </div>
  )
}

export { TrialBanner }
export type { TrialBannerVariant }
