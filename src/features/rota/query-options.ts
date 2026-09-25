import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"

import type { getRotaListPageDataInputSchema } from "@/features/rota/schemas/rota-server-schemas"
import { rotaQueryKeys } from "@/features/rota/query-keys"
import { getRotaListPageData } from "@/features/rota/server-fns"

type RotaListQueryInput = z.infer<typeof getRotaListPageDataInputSchema>

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
