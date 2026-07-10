"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { supportQueryKeys } from "@/features/support/query-keys"
import { updateSupportThreadStatusServerFn } from "@/features/support/server-fns"

function useSupportMutations() {
  const queryClient = useQueryClient()
  const updateSupportThreadStatus = useServerFn(
    updateSupportThreadStatusServerFn,
  )

  return {
    updateStatusMutation: useMutation({
      mutationFn: (input: {
        id: string
        status: "open" | "waiting" | "resolved" | "closed"
      }) => updateSupportThreadStatus({ data: input }),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: supportQueryKeys.all })
      },
    }),
  }
}

export { useSupportMutations }
