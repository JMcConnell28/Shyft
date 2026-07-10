"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { workspacesQueryKeys } from "@/features/workspaces/query-keys"
import { getWorkspacesPageData } from "@/features/workspaces/server-fns"

function useWorkspacesQuery() {
  const getWorkspacesPageDataFn = useServerFn(getWorkspacesPageData)

  return useQuery({
    queryKey: workspacesQueryKeys.all,
    queryFn: () => getWorkspacesPageDataFn(),
  })
}

export { useWorkspacesQuery }
