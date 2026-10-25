type DashboardEntry = {
  sessionId: string
  userId: string
  activeOrganizationId: string | null
  destination:
    | { kind: "join-status"; requestId: string }
    | {
        kind: "onboarding"
        path: "/onboarding/join" | "/onboarding/setup" | "/onboarding/location"
      }
    | { kind: "workspace"; workspaceSlug: string }
}

export type { DashboardEntry }
