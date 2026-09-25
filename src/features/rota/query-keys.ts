import type { RotaListQueryInput } from "@/features/rota/query-options"
import type { RotaWorkspaceQueryInput } from "@/features/rota/types/workspace-query"

const rotaQueryKeys = {
  all: ["rota"] as const,
  listPage: (input: RotaListQueryInput) =>
    [...rotaQueryKeys.all, "list-page", input] as const,
  creationPreview: (input: { locationId: string; weekStart: string }) =>
    [...rotaQueryKeys.all, "creation-preview", input] as const,
  workspace: (input: RotaWorkspaceQueryInput) =>
    [...rotaQueryKeys.all, "workspace", input] as const,
}

export { rotaQueryKeys }
