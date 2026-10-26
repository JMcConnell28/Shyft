import { useQuery } from "@tanstack/react-query"
import { getDefaultFeatureFlags } from "@rocketrota/shared/feature-flags"
import { getLocationFeatureAccess } from "../server-fns"
import type { LocationFeatureFlags } from "@rocketrota/shared/feature-flags/types"

function useLocationFeatureFlags(
  locationId: string,
  enabled = true
): LocationFeatureFlags {
  const query = useQuery({
    queryKey: ["feature-access", locationId],
    queryFn: () => getLocationFeatureAccess({ data: { locationId } }),
    enabled: enabled && Boolean(locationId),
    staleTime: 0,
    refetchInterval: 20000,
    refetchOnWindowFocus: "always",
  })
  if (!enabled) return getDefaultFeatureFlags()
  if (query.data) return query.data

  // Budget controls need a confirmed location flag, including after a failed read.
  return {
    ...getDefaultFeatureFlags(),
    "rota.budget_manager": { enabled: false, source: "default" },
  }
}
export { useLocationFeatureFlags }
