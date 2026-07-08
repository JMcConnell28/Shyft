"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { supportQueryKeys } from "@/features/support/query-keys"
import { getSupportThreads } from "@/features/support/server-fns"

function useSupportQuery() {
  const getSupportThreadsFn = useServerFn(getSupportThreads)

  return useQuery({
    queryKey: supportQueryKeys.all,
    queryFn: () => getSupportThreadsFn(),
  })
}

export { useSupportQuery }
