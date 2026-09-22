import type { ViewerState } from "@/features/onboarding/types"

type NavigationSession = {
  sessionId: string
  expiresAt: number
  activeOrganizationId: string | null
  user: ViewerState["user"]
}

type WorkspaceViewer = Pick<
  ViewerState,
  | "user"
  | "organizations"
  | "activeOrganization"
  | "activeWorkspace"
  | "activeRole"
  | "workspaces"
  | "trial"
  | "billing"
>

export type { NavigationSession, WorkspaceViewer }
