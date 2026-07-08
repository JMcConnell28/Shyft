type DashboardSummary = {
  activeFeatureFlags: number
  failedClockAttemptsToday: number
  openErrors: number
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
  activity: DashboardActivity[]
  summary: DashboardSummary
}

export type { DashboardActivity, DashboardData, DashboardSummary }
