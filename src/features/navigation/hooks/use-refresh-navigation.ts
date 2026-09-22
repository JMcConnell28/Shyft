import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"

import { navigationQueryKeys } from "@/features/navigation/query-keys"

function useRefreshNavigation(): () => Promise<void> {
  const queryClient = useQueryClient()
  const router = useRouter()

  return async () => {
    await queryClient.invalidateQueries({
      queryKey: navigationQueryKeys.all,
      refetchType: "none",
    })
    await router.invalidate()
  }
}

export { useRefreshNavigation }
