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
  timeAttendanceQuantity: number
  locations: Array<BillingPeriodUsage>
  hasActiveSubscription: boolean
  hasSavedPaymentMethod: boolean
}

type BillingAccountSummary = {
  id: string
  scope: "location" | "organization"
  payerName: string
  renewalDate: string | null
  status: BillingSubscriptionStatus | null
  hasSavedPaymentMethod: boolean
  canManage: boolean
}

type BillingPeriodUsage = {
  locationId: string
  locationName: string
  employeeHighWaterCount: number
  includedEmployeeCount: number
  extraEmployeeCount: number
  timeAttendanceEnabled: boolean
  timeAttendanceStatus: LocationAddon["status"] | null
  timeAttendanceCancelAt: string | null
  hardwareEntitlementAvailable: boolean
}

type LocationAddon = {
  type: "time_attendance"
  status: "legacy_pending" | "trialing" | "active" | "canceling" | "canceled"
  billingStartsAt: string | null
  cancelAt: string | null
  legacyOptInDeadline: string | null
}

type BillingTransfer = {
  id: string
  sourceBillingAccountId: string
  targetBillingAccountId: string
  status: "scheduled" | "ready" | "completed" | "failed" | "canceled"
  effectiveAt: string
}

type LocationEntitlement = {
  locationId: string
  billingAccountId: string
  accessState: "trial" | "active" | "grace" | "recovery"
  canWrite: boolean
  trialEndsAt: string
  renewalDate: string | null
  addon: LocationAddon | null
  pendingTransfer: BillingTransfer | null
  timeAttendanceEnabled: boolean
}

type OrganizationBillingLocationSummary = {
  locationId: string
  locationName: string
  billingAccountId: string
  payerLabel: string
  renewalDate: string | null
  accessState: LocationEntitlement["accessState"]
  employeeHighWaterCount: number
  includedEmployeeCount: number
  extraEmployeeCount: number
  timeAttendanceStatus: LocationAddon["status"] | null
  transfer: BillingTransfer | null
}

export type {
  BillingAccountSummary,
  BillingPeriodUsage,
  BillingTransfer,
  BillingSubscriptionStatus,
  LocationAddon,
  LocationEntitlement,
  OrganizationBillingLocationSummary,
  TrialDisplayState,
  TrialScope,
  WorkspaceBillingState,
  WorkspaceTrial,
}
