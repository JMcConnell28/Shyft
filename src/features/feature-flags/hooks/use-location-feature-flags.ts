import { useQuery } from "@tanstack/react-query"
import { getDefaultFeatureFlags } from "@rocketrota/shared/feature-flags"
import { getLocationFeatureAccess } from "../server-fns"

function useLocationFeatureFlags(locationId: string, enabled = true) {
  const query = useQuery({
    queryKey: ["feature-access", locationId],
    queryFn: () => getLocationFeatureAccess({ data: { locationId } }),
    enabled: enabled && Boolean(locationId),
    staleTime: 0,
    refetchInterval: 20000,
    refetchOnWindowFocus: "always",
  })
  return (enabled ? query.data : undefined) ?? getDefaultFeatureFlags()
}
export { useLocationFeatureFlags }
