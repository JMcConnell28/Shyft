"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { supportQueryKeys } from "@/features/support/query-keys"
import {
  replyToSupportThreadServerFn,
  updateSupportThreadStatusServerFn,
} from "@/features/support/server-fns"

function useSupportMutations() {
  const queryClient = useQueryClient()
  const updateSupportThreadStatus = useServerFn(
    updateSupportThreadStatusServerFn
  )
  const replyToSupportThread = useServerFn(replyToSupportThreadServerFn)

  return {
    updateStatusMutation: useMutation({
      mutationFn: (id: string) =>
        updateSupportThreadStatus({ data: { id, status: "resolved" } }),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: supportQueryKeys.all })
      },
    }),
    replyMutation: useMutation({
      mutationFn: (input: { id: string; body: string }) =>
        replyToSupportThread({ data: input }),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: supportQueryKeys.all })
      },
    }),
  }
}

export { useSupportMutations }
