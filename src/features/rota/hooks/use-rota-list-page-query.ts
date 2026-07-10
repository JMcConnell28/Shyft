"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import type { RotaListSearch } from "@/features/rota/schemas/rota-schemas"
import { rotaQueryKeys } from "@/features/rota/query-keys"
import { getRotaListPageData } from "@/features/rota/server-fns"

function useRotaListPageQuery(input: {
  organizationId?: string
  locationId?: string
  orgSlug?: string
  locationSlug?: string
  userId: string
  search: RotaListSearch
}) {
  const getRotaListPageDataFn = useServerFn(getRotaListPageData)

  return useQuery({
    queryKey: rotaQueryKeys.listPage(input),
    queryFn: () =>
      getRotaListPageDataFn({
        data: input,
      }),
  })
}

export { useRotaListPageQuery }
