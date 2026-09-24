import { CreditCardIcon } from "lucide-react"

import type {
  BillingSettingsStatus,
  WorkspaceBillingState,
  WorkspaceTrial,
} from "@/features/billing/types"
import { BillingPortalButton } from "@/features/billing/components/billing-portal-button"
import {
  BillingSettingRow,
  BillingSettingValue,
  BillingStatusPill,
} from "@/features/billing/components/billing-setting-row"
import { CheckoutButton } from "@/features/billing/components/checkout-button"
import {
  getPaymentMethodDescription,
  getPlanValue,
  getTrialDescription,
  getTrialValue,
} from "@/features/billing/utils/billing-settings"
import { getTrialDisplayState } from "@/features/billing/utils/trial-state"
import {
  CORE_MONTHLY_PRICE_PENCE,
  formatMonthlyPrice,
} from "@/features/billing/utils/monthly-pricing"
import { SettingsSection } from "@/features/settings/components/settings-section"

function BillingSubscriptionSection({
  billing,
  locationId,
  organizationId,
  status,
  trial,
}: {
  billing: WorkspaceBillingState | null
  locationId?: string | null
  organizationId?: string | null
  status: BillingSettingsStatus
  trial: WorkspaceTrial | null
}) {
  const canOpenPortal = Boolean(billing?.stripeCustomerId)
  const trialState = getTrialDisplayState(trial)
  const canStartCheckout =
    !billing?.hasActiveSubscription &&
    billing?.subscriptionStatus !== "past_due" &&
    !billing?.hasSavedPaymentMethod

  return (
    <SettingsSection
      description="Your RocketRota plan, trial, and payment method."
      icon={CreditCardIcon}
      title="Subscription"
    >
      <BillingSettingRow
        description={`${formatMonthlyPrice(CORE_MONTHLY_PRICE_PENCE)} per month, including the first 10 used employees.`}
        title="Plan"
      >
        <BillingSettingValue>{getPlanValue(billing)}</BillingSettingValue>
      </BillingSettingRow>
      <BillingSettingRow
        description="The current state of billing for this workspace."
        title="Status"
      >
        <BillingStatusPill label={status.label} tone={status.tone} />
      </BillingSettingRow>
      <BillingSettingRow description={getTrialDescription(trial)} title="Trial">
        <BillingSettingValue>{getTrialValue(trial)}</BillingSettingValue>
      </BillingSettingRow>
      <BillingSettingRow
        description={getPaymentMethodDescription(billing)}
        title="Payment method"
      >
        <BillingSettingValue
          tone={billing?.hasSavedPaymentMethod ? "positive" : "warning"}
        >
          {billing?.hasSavedPaymentMethod ? "Saved" : "Not saved"}
        </BillingSettingValue>
      </BillingSettingRow>
      <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#14214a]">{status.title}</p>
          <p className="mt-0.5 max-w-xl text-[11px] leading-[1.1rem] font-medium text-[#7180a2]">
            {status.description}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {canStartCheckout ? (
            <CheckoutButton
              className="h-8 rounded-lg px-3 text-[11px] font-bold"
              locationId={locationId}
              organizationId={organizationId}
            >
              {trialState?.isExpired ? "Choose plan" : "Add payment method"}
            </CheckoutButton>
          ) : null}
          {canOpenPortal ? (
            <BillingPortalButton
              className="h-8 rounded-lg px-3 text-[11px] font-bold"
              locationId={locationId}
              organizationId={organizationId}
            />
          ) : null}
        </div>
      </div>
    </SettingsSection>
  )
}

export { BillingSubscriptionSection }
