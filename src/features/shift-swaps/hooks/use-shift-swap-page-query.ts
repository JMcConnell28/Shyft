"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import type { ShiftSwapPageData } from "@/features/shift-swaps/types"
import { shiftSwapQueryKeys } from "@/features/shift-swaps/query-keys"
import { getShiftSwapPageData } from "@/features/shift-swaps/server-fns"

type ShiftSwapScopeInput = {
  organizationId?: string
  locationId?: string
  userId: string
}

function useShiftSwapPageQuery(
  input: ShiftSwapScopeInput,
  initialData?: ShiftSwapPageData
) {
  const getShiftSwapPageDataFn = useServerFn(getShiftSwapPageData)

  return useQuery({
    queryKey: shiftSwapQueryKeys.page(input),
    queryFn: () => getShiftSwapPageDataFn({ data: input }),
    initialData,
    refetchInterval: 20000,
  })
}

export { useShiftSwapPageQuery }
export type { ShiftSwapScopeInput }
