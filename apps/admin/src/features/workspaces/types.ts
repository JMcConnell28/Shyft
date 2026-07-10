type WorkspaceSummary = {
  activeEmployees: number
  billingStatus: string | null
  locationId: string
  locationName: string
  organizationId: string | null
  organizationName: string | null
  trialEndsAt: string | null
}

type WorkspacesPageData = {
  workspaces: WorkspaceSummary[]
}

export type { WorkspaceSummary, WorkspacesPageData }
