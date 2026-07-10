"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { featureFlagsQueryKeys } from "@/features/feature-flags/query-keys"
import {
  createFeatureFlagServerFn,
  updateFeatureFlagServerFn,
} from "@/features/feature-flags/server-fns"

function useFeatureFlagMutations() {
  const queryClient = useQueryClient()
  const createFeatureFlag = useServerFn(createFeatureFlagServerFn)
  const updateFeatureFlag = useServerFn(updateFeatureFlagServerFn)

  async function invalidate() {
    await queryClient.invalidateQueries({
      queryKey: featureFlagsQueryKeys.all,
    })
  }

  return {
    createMutation: useMutation({
      mutationFn: (input: {
        defaultValue: boolean
        description?: string
        key: string
        name: string
      }) => createFeatureFlag({ data: input }),
      onSuccess: invalidate,
    }),
    updateMutation: useMutation({
      mutationFn: (input: { id: string; isEnabled?: boolean }) =>
        updateFeatureFlag({ data: input }),
      onSuccess: invalidate,
    }),
  }
}

export { useFeatureFlagMutations }
