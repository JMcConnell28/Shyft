import type {
  WorkspaceBillingState,
  WorkspaceTrial,
} from "@/features/billing/types"
import { getTrialDisplayState } from "@/features/billing/utils/trial-state"

function hasPaidWorkspaceAccess(
  billing: WorkspaceBillingState | null | undefined
) {
  const graceEndsAt = billing?.pastDueGraceEndsAt
  return Boolean(
    billing?.hasActiveSubscription ||
    (billing?.subscriptionStatus === "past_due" &&
      graceEndsAt &&
      new Date(graceEndsAt).getTime() > Date.now())
  )
}

function isWorkspaceBillingBlocked(input: {
  trial: WorkspaceTrial | null | undefined
  billing: WorkspaceBillingState | null | undefined
}) {
  const trialState = getTrialDisplayState(input.trial)
  const isMissedPayment =
    (input.billing?.subscriptionStatus === "past_due" &&
      !hasPaidWorkspaceAccess(input.billing)) ||
    input.billing?.subscriptionStatus === "unpaid" ||
    input.billing?.subscriptionStatus === "incomplete_expired"

  return Boolean(
    isMissedPayment ||
    (trialState?.isExpired && !hasPaidWorkspaceAccess(input.billing))
  )
}

export { hasPaidWorkspaceAccess, isWorkspaceBillingBlocked }
