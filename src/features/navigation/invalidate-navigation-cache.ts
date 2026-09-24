import type { QueryClient } from "@tanstack/react-query"

import { navigationQueryKeys } from "@/features/navigation/query-keys"

function invalidateNavigationCache(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: navigationQueryKeys.all,
    refetchType: "none",
  })
}

export { invalidateNavigationCache }
