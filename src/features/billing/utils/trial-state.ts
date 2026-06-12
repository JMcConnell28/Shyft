import type {
  TrialDisplayState,
  WorkspaceTrial,
} from "@/features/billing/types"

const TRIAL_ENDING_SOON_DAYS = 3

function getTrialDisplayState(
  trial: WorkspaceTrial | null | undefined,
  now = new Date(),
): TrialDisplayState | null {
  if (!trial) {
    return null
  }

  const trialEndsAt = new Date(trial.trialEndsAt)
  const millisecondsRemaining = trialEndsAt.getTime() - now.getTime()
  const daysRemaining = Math.ceil(
    millisecondsRemaining / (24 * 60 * 60 * 1000),
  )
  const isExpired = trial.status === "expired" || millisecondsRemaining <= 0

  return {
    ...trial,
    daysRemaining: Math.max(daysRemaining, 0),
    isExpired,
    isEndingSoon:
      !isExpired &&
      trial.status === "trialing" &&
      daysRemaining <= TRIAL_ENDING_SOON_DAYS,
  }
}

export { TRIAL_ENDING_SOON_DAYS, getTrialDisplayState }
