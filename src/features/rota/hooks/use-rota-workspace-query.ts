"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { rotaQueryKeys } from "@/features/rota/query-keys"
import { getRotaWorkspaceData } from "@/features/rota/server-fns"

function useRotaWorkspaceQuery(input: {
  organizationId?: string
  locationId?: string
  orgSlug?: string
  userId: string
  locationSlug: string
  rotaId: string
  publishedOnly: boolean
}) {
  const getRotaWorkspaceDataFn = useServerFn(getRotaWorkspaceData)

  return useQuery({
    queryKey: rotaQueryKeys.workspace(input),
    queryFn: () =>
      getRotaWorkspaceDataFn({
        data: input,
      }),
  })
}

export { useRotaWorkspaceQuery }
