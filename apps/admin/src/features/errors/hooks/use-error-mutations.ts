"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { errorsQueryKeys } from "@/features/errors/query-keys"
import { updateErrorStatusServerFn } from "@/features/errors/server-fns"

function useErrorMutations() {
  const queryClient = useQueryClient()
  const updateErrorStatus = useServerFn(updateErrorStatusServerFn)

  return {
    updateStatusMutation: useMutation({
      mutationFn: (input: {
        id: string
        status: "open" | "reviewing" | "resolved" | "ignored"
      }) => updateErrorStatus({ data: input }),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: errorsQueryKeys.all })
      },
    }),
  }
}

export { useErrorMutations }
