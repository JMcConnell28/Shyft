import { queryOptions } from "@tanstack/react-query"

import { timeClockQueryKeys } from "@/features/time-clock/query-keys"
import { getManagerClockPageData } from "@/features/time-clock/server-fns"

type ManagerClockQueryInput = {
  date?: string
  organizationId?: string
  locationId?: string
  userId: string
}

function managerClockQueryOptions(
  input: ManagerClockQueryInput,
  fetcher: (options: {
    data: ManagerClockQueryInput
  }) => ReturnType<typeof getManagerClockPageData> = getManagerClockPageData
) {
  return queryOptions({
    queryKey: timeClockQueryKeys.manager(input),
    queryFn: () => fetcher({ data: input }),
    refetchInterval: 30000,
  })
}

export { managerClockQueryOptions }
