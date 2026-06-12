type TrialScope = "organization" | "location"

type WorkspaceTrial = {
  scope: TrialScope
  organizationId: string | null
  locationId: string | null
  status: "trialing" | "active" | "expired" | "canceled"
  trialStartedAt: string
  trialEndsAt: string
}

type TrialDisplayState = WorkspaceTrial & {
  daysRemaining: number
  isExpired: boolean
  isEndingSoon: boolean
}

type BillingSubscriptionStatus =
  | "incomplete"
  | "payment_method_saved"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused"

type WorkspaceBillingState = {
  billingAccountId: string
  stripeCustomerId: string | null
  stripePaymentMethodId: string | null
  paymentMethodSavedAt: string | null
  subscriptionStatus: BillingSubscriptionStatus | null
  pastDueStartedAt: string | null
  pastDueGraceEndsAt: string | null
  isPastDueGraceActive: boolean
  locationQuantity: number
  activeEmployeeQuantity: number
  includedEmployeeQuantity: number
  extraEmployeeQuantity: number
  hasActiveSubscription: boolean
  hasSavedPaymentMethod: boolean
}

export type {
  BillingSubscriptionStatus,
  TrialDisplayState,
  TrialScope,
  WorkspaceBillingState,
  WorkspaceTrial,
}
