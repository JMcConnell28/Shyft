import { useQuery } from "@tanstack/react-query"
import {
  getFeatureFlagHistory,
  getFeatureFlagLocations,
  getLocationFlags,
} from "../server-fns"
import { featureFlagsQueryKeys } from "../query-keys"
import type { FlagDetailsInput } from "../schemas/feature-flag-schemas"
import type { FeatureFlagKey } from "@rocketrota/shared/feature-flags/types"

function useFlagLocations(input: FlagDetailsInput) {
  return useQuery({
    queryKey: [...featureFlagsQueryKeys.all, "locations", input],
    queryFn: () => getFeatureFlagLocations({ data: input }),
    refetchInterval: 15000,
  })
}
function useFlagHistory(key: FeatureFlagKey) {
  return useQuery({
    queryKey: [...featureFlagsQueryKeys.all, "history", key],
    queryFn: () => getFeatureFlagHistory({ data: key }),
    refetchInterval: 15000,
  })
}
function useLocationFlags(locationId: string, enabled: boolean) {
  return useQuery({
    queryKey: [...featureFlagsQueryKeys.all, "location", locationId],
    queryFn: () => getLocationFlags({ data: { locationId } }),
    enabled,
    refetchInterval: 15000,
  })
}
export { useFlagLocations, useFlagHistory, useLocationFlags }
