type OrganizationSummary = {
  id: string
  name: string
  slug: string
}

type LocationSummary = {
  id: string
  name: string
  slug: string
}

type StaffGroupSummary = {
  id: string
  name: string
  slug: string
  isDefault: boolean
}

type OnboardingStep = "location" | "invite" | "complete"

type ActiveOnboardingState = {
  organizationId: string
  trialStartedAt: string | null
  trialEndsAt: string | null
  completedAt: string | null
  lastStep: OnboardingStep
  hasLocation: boolean
  hasZone: boolean
  hasInviteLink: boolean
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
  onboarding: ActiveOnboardingState | null
  locations: Array<LocationSummary>
  staffGroups: Array<StaffGroupSummary>
}

export type {
  ActiveOnboardingState,
  LocationSummary,
  OnboardingStep,
  OrganizationSummary,
  StaffGroupSummary,
  ViewerState,
}
