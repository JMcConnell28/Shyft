type DashboardSummary = {
  activeFeatureFlags: number
  failedClockAttemptsToday: number
  openErrors: number
  openPaymentReviews: number
  billingReconciliationNeedsAttention: boolean
  openSupportThreads: number
  trialExpiringSoon: number
}

type DashboardActivity = {
  id: string
  label: string
  occurredAt: string
  type: string
}

type DashboardData = {
  activity: Array<DashboardActivity>
  summary: DashboardSummary
}

export type { DashboardActivity, DashboardData, DashboardSummary }
