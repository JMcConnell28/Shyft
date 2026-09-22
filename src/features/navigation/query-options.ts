import { queryOptions } from "@tanstack/react-query"

import type { WorkspaceViewerInput } from "@/features/navigation/schemas/navigation-schemas"
import { navigationQueryKeys } from "@/features/navigation/query-keys"
import {
  getNavigationSession,
  getWorkspaceViewer,
} from "@/features/navigation/server-fns"

const NAVIGATION_STALE_TIME = 30_000

function navigationSessionQueryOptions() {
  return queryOptions({
    queryKey: navigationQueryKeys.session,
    queryFn: () => getNavigationSession(),
    staleTime: NAVIGATION_STALE_TIME,
    retry: false,
  })
}

function workspaceViewerQueryOptions(input: WorkspaceViewerInput) {
  return queryOptions({
    queryKey: navigationQueryKeys.workspace(input),
    queryFn: () => getWorkspaceViewer({ data: input }),
    staleTime: NAVIGATION_STALE_TIME,
    retry: false,
  })
}

export { navigationSessionQueryOptions, workspaceViewerQueryOptions }
