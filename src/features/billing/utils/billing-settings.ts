import type {
  BillingSettingsStatus,
  WorkspaceBillingState,
  WorkspaceTrial,
} from "@/features/billing/types"
import { PAST_DUE_GRACE_DAYS } from "@/features/billing/constants"
import { getTrialDisplayState } from "@/features/billing/utils/trial-state"

function getBillingStatus(input: {
  billing: WorkspaceBillingState | null
  trial: WorkspaceTrial | null
}): BillingSettingsStatus {
  const trialState = getTrialDisplayState(input.trial)

  if (input.billing?.subscriptionStatus === "past_due") {
    const graceEndsAt = input.billing.pastDueGraceEndsAt
    return {
      label: "Past due",
      title: input.billing.isPastDueGraceActive
        ? "Payment failed"
        : "Payment grace ended",
      description: input.billing.isPastDueGraceActive
        ? `Stripe could not collect the latest payment. Access remains open during the ${PAST_DUE_GRACE_DAYS}-day grace period${graceEndsAt ? `, ending ${formatBillingDate(graceEndsAt)}` : ""}.`
        : "Stripe could not collect payment and the grace period has ended. Update the payment method to restore access.",
      tone: "danger",
    }
  }

  if (input.billing?.subscriptionStatus === "unpaid") {
    return billingStatus(
      "Unpaid",
      "Payment required",
      "The subscription is unpaid. Update the payment method in Stripe to restore access.",
      "danger"
    )
  }

  if (input.billing?.subscriptionStatus === "canceled") {
    return billingStatus(
      "Canceled",
      "Subscription canceled",
      "Choose a plan to restart billing for this workspace.",
      "danger"
    )
  }

  if (input.billing?.subscriptionStatus === "incomplete_expired") {
    return billingStatus(
      "Expired",
      "Checkout expired",
      "The previous checkout was not completed. Choose a plan to continue.",
      "danger"
    )
  }

  if (input.billing?.hasActiveSubscription) {
    return billingStatus(
      "Active",
      "Subscription active",
      "Use Stripe billing management to update payment methods, invoices, and subscription details.",
      "positive"
    )
  }

  if (input.billing?.hasSavedPaymentMethod) {
    return billingStatus(
      "Card saved",
      "Payment method saved",
      "The saved payment method will be used when the trial ends. No payment has been taken yet.",
      "positive"
    )
  }

  if (trialState?.isExpired) {
    return billingStatus(
      "Expired",
      "Choose a plan to continue",
      "The trial has ended. Add billing to restore paid rota access.",
      "danger"
    )
  }

  return billingStatus(
    "Trial",
    "Trial active",
    "Add a payment method before the trial ends to keep rota access uninterrupted.",
    "neutral"
  )
}

function billingStatus(
  label: string,
  title: string,
  description: string,
  tone: BillingSettingsStatus["tone"]
): BillingSettingsStatus {
  return { description, label, title, tone }
}

function getPaymentMethodDescription(billing: WorkspaceBillingState | null) {
  return billing?.paymentMethodSavedAt
    ? `Saved ${formatBillingDate(billing.paymentMethodSavedAt)}`
    : "Needed before paid access starts"
}

function getPlanValue(billing: WorkspaceBillingState | null) {
  const quantity = billing?.locationQuantity ?? 0
  return `${quantity} included location${quantity === 1 ? "" : "s"}`
}

function getEmployeeDescription(billing: WorkspaceBillingState | null) {
  return `${billing?.includedEmployeeQuantity ?? 10} included; unused staff are excluded`
}

function getTrialValue(trial: WorkspaceTrial | null) {
  const state = getTrialDisplayState(trial)
  if (!state) return "Not started"
  if (state.isExpired) return "Ended"
  return `${state.daysRemaining} day${state.daysRemaining === 1 ? "" : "s"} left`
}

function getTrialDescription(trial: WorkspaceTrial | null) {
  const state = getTrialDisplayState(trial)
  return state
    ? `Ends ${formatBillingDate(state.trialEndsAt)}`
    : "Trial status is not available"
}

function formatBillingDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export {
  formatBillingDate,
  getBillingStatus,
  getEmployeeDescription,
  getPaymentMethodDescription,
  getPlanValue,
  getTrialDescription,
  getTrialValue,
}
