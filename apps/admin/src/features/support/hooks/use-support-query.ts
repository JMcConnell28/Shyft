"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { supportQueryKeys } from "@/features/support/query-keys"
import { getSupportThreads } from "@/features/support/server-fns"

function useSupportQuery(page: number) {
  const getSupportThreadsFn = useServerFn(getSupportThreads)

  return useQuery({
    queryKey: supportQueryKeys.list(page),
    queryFn: () => getSupportThreadsFn({ data: { page } }),
    refetchOnWindowFocus: "always",
  })
}

export { useSupportQuery }
