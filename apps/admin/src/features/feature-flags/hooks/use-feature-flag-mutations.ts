import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  updateFeatureFlagServerFn,
  updateLocationFlagServerFn,
} from "../server-fns"
import { featureFlagsQueryKeys } from "../query-keys"
import type {
  UpdateFeatureFlagInput,
  UpdateLocationFlagInput,
} from "../schemas/feature-flag-schemas"

function useFeatureFlagMutations() {
  const client = useQueryClient()
  const invalidate = () =>
    client.invalidateQueries({ queryKey: featureFlagsQueryKeys.all })
  return {
    updateMutation: useMutation({
      mutationFn: (data: UpdateFeatureFlagInput) =>
        updateFeatureFlagServerFn({ data }),
      onSettled: invalidate,
    }),
    locationMutation: useMutation({
      mutationFn: (data: UpdateLocationFlagInput) =>
        updateLocationFlagServerFn({ data }),
      onSettled: invalidate,
    }),
  }
}
export { useFeatureFlagMutations }
