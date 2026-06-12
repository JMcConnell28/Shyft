"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { settingsQueryKeys } from "@/features/settings/query-keys"
import { getWorkspaceConnectionsPageData } from "@/features/settings/server-fns"

function useWorkspaceConnectionsQuery(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const getWorkspaceConnectionsPageDataFn = useServerFn(
    getWorkspaceConnectionsPageData,
  )

  return useQuery({
    queryKey: settingsQueryKeys.connections(input),
    queryFn: () =>
      getWorkspaceConnectionsPageDataFn({
        data: input,
      }),
  })
}

export { useWorkspaceConnectionsQuery }
