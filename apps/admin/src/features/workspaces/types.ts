type WorkspaceSummary = {
  activeEmployees: number
  billingStatus: string | null
  billingAccountId: string | null
  locationId: string
  locationName: string
  organizationId: string | null
  organizationName: string | null
  trialEndsAt: string | null
}

type WorkspacesPageData = {
  workspaces: Array<WorkspaceSummary>
}

export type { WorkspaceSummary, WorkspacesPageData }
