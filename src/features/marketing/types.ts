type MarketingFeatureSlug =
  | "rota-planning"
  | "time-tracking"
  | "timesheets"
  | "team-management"
  | "manager-dashboard"
  | "staff-updates"

type MarketingWorkflowItem = { title: string; description: string }

type MarketingFeaturePageContent = {
  navTitle: string
  headline: readonly [string, string]
  description: string
  workflowTitle: string
  workflowDescription: string
  workflowItems: ReadonlyArray<MarketingWorkflowItem>
  proofItems: ReadonlyArray<string>
}

export type {
  MarketingFeatureSlug,
  MarketingFeaturePageContent,
  MarketingWorkflowItem,
}
