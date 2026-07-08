"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { usersQueryKeys } from "@/features/users/query-keys"
import {
  createImpersonationSessionServerFn,
  updateAppUserStatusServerFn,
} from "@/features/users/server-fns"

function useUserMutations() {
  const queryClient = useQueryClient()
  const updateAppUserStatus = useServerFn(updateAppUserStatusServerFn)
  const createImpersonationSession = useServerFn(
    createImpersonationSessionServerFn,
  )

  return {
    impersonationMutation: useMutation({
      mutationFn: (input: { reason: string; userId: string }) =>
        createImpersonationSession({ data: input }),
    }),
    statusMutation: useMutation({
      mutationFn: (input: {
        reason?: string
        status: "active" | "deactivated"
        userId: string
      }) => updateAppUserStatus({ data: input }),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
      },
    }),
  }
}

export { useUserMutations }
