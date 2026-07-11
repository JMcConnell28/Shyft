import { queryOptions } from "@tanstack/react-query"

import type { RotaListSearch } from "@/features/rota/schemas/rota-schemas"
import { rotaQueryKeys } from "@/features/rota/query-keys"
import { getRotaListPageData } from "@/features/rota/server-fns"

type RotaListQueryInput = {
  organizationId?: string
  locationId?: string
  orgSlug?: string
  locationSlug?: string
  userId: string
  search: RotaListSearch
}

function rotaListQueryOptions(
  input: RotaListQueryInput,
  fetcher: (options: {
    data: RotaListQueryInput
  }) => ReturnType<typeof getRotaListPageData> = getRotaListPageData
) {
  return queryOptions({
    queryKey: rotaQueryKeys.listPage(input),
    queryFn: () => fetcher({ data: input }),
  })
}

export { rotaListQueryOptions }
export type { RotaListQueryInput }
