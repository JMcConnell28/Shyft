import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { cancelOrganizationSubscription } from "@/features/billing/server/workspace-closure-server-fns"
import { navigationQueryKeys } from "@/features/navigation/query-keys"

function useCancelOrganizationSubscription(organizationId: string) {
  const cancel = useServerFn(cancelOrganizationSubscription)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => cancel({ data: { organizationId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: navigationQueryKeys.viewers,
        refetchType: "none",
      })
    },
  })
}

export { useCancelOrganizationSubscription }
