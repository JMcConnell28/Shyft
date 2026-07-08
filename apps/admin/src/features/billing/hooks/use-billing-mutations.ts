"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { billingQueryKeys } from "@/features/billing/query-keys"
import { extendTrialServerFn } from "@/features/billing/server-fns"

function useBillingMutations() {
  const queryClient = useQueryClient()
  const extendTrial = useServerFn(extendTrialServerFn)

  return {
    extendTrialMutation: useMutation({
      mutationFn: (input: {
        days: number
        locationId: string
        reason: string
      }) => extendTrial({ data: input }),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: billingQueryKeys.all })
      },
    }),
  }
}

export { useBillingMutations }
