"use client"

import type { RotaWorkspaceRouteInput } from "@/features/rota/types/workspace-query"
import { getRotaWorkspaceQueryInput } from "@/features/rota/workspace-query-options"
import { RotaWorkspaceSkeleton } from "@/features/rota/components/rota-workspace-skeleton"
import { RotaWorkspaceErrorState } from "@/features/rota/components/rota-workspace-error-state"
import RotaViewWorkspace from "@/features/rota/components/rota-view-workspace"
import RotaWorkspace from "@/features/rota/components/rota-workspace"
import { useRotaWorkspaceQuery } from "@/features/rota/hooks/use-rota-workspace-query"

function WorkspaceRotaDetailPage({
  locationSlug,
  publishedOnly,
  rotaId,
  userId,
  workspace,
}: RotaWorkspaceRouteInput) {
  const workspaceQuery = useRotaWorkspaceQuery(
    getRotaWorkspaceQueryInput({
      workspace,
      locationSlug,
      rotaId,
      userId,
      publishedOnly,
    })
  )

  if (workspaceQuery.isPending) {
    return <RotaWorkspaceSkeleton publishedOnly={publishedOnly} />
  }

  if (workspaceQuery.isError) {
    return (
      <RotaWorkspaceErrorState
        title={
          publishedOnly
            ? "Published rota unavailable"
            : "We could not load this rota"
        }
        message={
          workspaceQuery.error instanceof Error
            ? workspaceQuery.error.message
            : publishedOnly
              ? "We could not load the published rota."
              : "We could not load that rota board."
        }
        onRetry={() => {
          void workspaceQuery.refetch()
        }}
      />
    )
  }

  if (publishedOnly) {
    return <RotaViewWorkspace boardData={workspaceQuery.data} />
  }

  return <RotaWorkspace boardData={workspaceQuery.data} />
}

export { WorkspaceRotaDetailPage }
