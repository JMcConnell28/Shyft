import { queryOptions } from "@tanstack/react-query"

import type {
  RotaWorkspaceQueryInput,
  RotaWorkspaceRouteInput,
} from "@/features/rota/types/workspace-query"
import { rotaQueryKeys } from "@/features/rota/query-keys"
import { getRotaWorkspaceData } from "@/features/rota/server-fns"

function getRotaWorkspaceQueryInput({
  workspace,
  locationSlug,
  rotaId,
  userId,
  publishedOnly,
}: RotaWorkspaceRouteInput): RotaWorkspaceQueryInput {
  if (!locationSlug) {
    throw new Error("A location slug is required for organization rota routes.")
  }

  return {
    rotaId,
    userId,
    publishedOnly,
    organizationId: workspace.id,
    orgSlug: workspace.slug,
    locationSlug,
  }
}

function rotaWorkspaceQueryOptions(
  input: RotaWorkspaceQueryInput,
  fetcher: (options: {
    data: RotaWorkspaceQueryInput
  }) => ReturnType<typeof getRotaWorkspaceData> = getRotaWorkspaceData
) {
  return queryOptions({
    queryKey: rotaQueryKeys.workspace(input),
    queryFn: () => fetcher({ data: input }),
    staleTime: 30_000,
    // Surface access/not-found failures promptly; the error state offers a retry.
    retry: false,
  })
}

export { getRotaWorkspaceQueryInput, rotaWorkspaceQueryOptions }
