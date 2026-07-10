import type {
  WorkspaceBillingState,
  WorkspaceTrial,
} from "@/features/billing/types"
import { getTrialDisplayState } from "@/features/billing/utils/trial-state"

function hasPaidWorkspaceAccess(
  billing: WorkspaceBillingState | null | undefined,
) {
  return Boolean(
    billing?.hasActiveSubscription ||
      (billing?.subscriptionStatus === "past_due" &&
        billing.isPastDueGraceActive),
  )
}

function isWorkspaceBillingBlocked(input: {
  trial: WorkspaceTrial | null | undefined
  billing: WorkspaceBillingState | null | undefined
}) {
  const trialState = getTrialDisplayState(input.trial)

  return Boolean(trialState?.isExpired && !hasPaidWorkspaceAccess(input.billing))
}

export { hasPaidWorkspaceAccess, isWorkspaceBillingBlocked }
