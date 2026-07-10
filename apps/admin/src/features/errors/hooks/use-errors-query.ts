"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { errorsQueryKeys } from "@/features/errors/query-keys"
import { getErrors } from "@/features/errors/server-fns"

function useErrorsQuery() {
  const getErrorsFn = useServerFn(getErrors)

  return useQuery({
    queryKey: errorsQueryKeys.all,
    queryFn: () => getErrorsFn(),
  })
}

export { useErrorsQuery }
