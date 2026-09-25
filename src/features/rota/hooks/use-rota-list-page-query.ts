"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import type { RotaListQueryInput } from "@/features/rota/query-options"
// eslint-disable-next-line no-duplicate-imports
import { rotaListQueryOptions } from "@/features/rota/query-options"
import { getRotaListPageData } from "@/features/rota/server-fns"

function useRotaListPageQuery(input: RotaListQueryInput) {
  const getRotaListPageDataFn = useServerFn(getRotaListPageData)

  return useQuery(rotaListQueryOptions(input, getRotaListPageDataFn))
}

export { useRotaListPageQuery }
