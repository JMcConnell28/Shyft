import type { RotaListQueryInput } from "@/features/rota/query-options"
import type { RotaWorkspaceQueryInput } from "@/features/rota/types/workspace-query"

const rotaQueryKeys = {
  all: ["rota"] as const,
  listPages: ["rota", "list-page"] as const,
  workspaces: ["rota", "workspace"] as const,
  unreadUpdates: (input: { organizationId: string; userId: string }) =>
    [...rotaQueryKeys.all, "unread-updates", input] as const,
  listPage: (input: RotaListQueryInput) =>
    [...rotaQueryKeys.listPages, input] as const,
  creationPreview: (input: { locationId: string; weekStart: string }) =>
    [...rotaQueryKeys.all, "creation-preview", input] as const,
  workspace: (input: RotaWorkspaceQueryInput) =>
    [...rotaQueryKeys.workspaces, input] as const,
}

export { rotaQueryKeys }
