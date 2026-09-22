import type { QueryClient } from "@tanstack/react-query"

import type { RotaWorkspaceRouteInput } from "@/features/rota/types/workspace-query"
import {
  getRotaWorkspaceQueryInput,
  rotaWorkspaceQueryOptions,
} from "@/features/rota/workspace-query-options"

async function loadRotaWorkspace(
  queryClient: QueryClient,
  input: Omit<RotaWorkspaceRouteInput, "workspace"> & {
    workspace: RotaWorkspaceRouteInput["workspace"] | null
    workspaceType: RotaWorkspaceRouteInput["workspace"]["type"]
  }
): Promise<void> {
  const { workspace, workspaceType, ...routeInput } = input

  if (!workspace || workspace.type !== workspaceType) {
    throw new Error(
      `A ${workspaceType} workspace is required for this rota route.`
    )
  }

  // Warm the same cache used by the page. Do not refresh an already mounted
  // editor during speculative preloading, which could replace unsaved changes.
  await queryClient.ensureQueryData(
    rotaWorkspaceQueryOptions(
      getRotaWorkspaceQueryInput({ ...routeInput, workspace })
    )
  )
}

export { loadRotaWorkspace }
