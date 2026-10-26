import { queryOptions } from "@tanstack/react-query"
import type { getPersonalDataRequests } from "./server-fns"

const personalDataKeys = {
  user: (userId: string) => ["personal-data", userId] as const,
}
function personalDataQueryOptions(
  userId: string,
  fetcher: () => ReturnType<typeof getPersonalDataRequests>
) {
  return queryOptions({
    queryKey: personalDataKeys.user(userId),
    queryFn: () => fetcher(),
    refetchInterval: 30000,
    staleTime: 0,
    gcTime: 0,
  })
}
export { personalDataKeys, personalDataQueryOptions }
