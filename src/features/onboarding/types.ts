type OrganizationSummary = {
  id: string
  name: string
  slug: string
}

type LocationSummary = {
  id: string
  name: string
  slug: string
  organizationId?: string | null
}

type WorkspaceSummary = {
  id: string
  name: string
  slug: string
  type: "location" | "organization"
  organizationId: string | null
}

type StaffGroupSummary = {
  id: string
  name: string
  slug: string
  isFallback: boolean
}

type OnboardingStep = "location" | "invite" | "complete"
type OnboardingIntent = "manage" | "join"

type ActiveOnboardingState = {
  organizationId: string | null
  locationId?: string | null
  trialStartedAt: string | null
  trialEndsAt: string | null
  completedAt: string | null
  lastStep: OnboardingStep
  hasLocation: boolean
  hasZone: boolean
  hasInviteLink: boolean
}

type WorkspaceTrialState = {
  scope: "organization" | "location"
  organizationId: string | null
  locationId: string | null
  status: "trialing" | "active" | "expired" | "canceled"
  trialStartedAt: string
  trialEndsAt: string
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

type ViewerState = {
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
  }
  activeOrganizationId: string | null
  organizations: Array<OrganizationSummary>
  activeOrganization: OrganizationSummary | null
  activeWorkspace: WorkspaceSummary | null
  workspaces: Array<WorkspaceSummary>
  onboarding: ActiveOnboardingState | null
  trial: WorkspaceTrialState | null
  billing: WorkspaceBillingState | null
  onboardingIntent: OnboardingIntent
  locations: Array<LocationSummary>
  staffGroups: Array<StaffGroupSummary>
}

export type {
  ActiveOnboardingState,
  LocationSummary,
  OnboardingStep,
  OnboardingIntent,
  OrganizationSummary,
  StaffGroupSummary,
  BillingSubscriptionStatus,
  WorkspaceBillingState,
  WorkspaceTrialState,
  ViewerState,
  WorkspaceSummary,
}
