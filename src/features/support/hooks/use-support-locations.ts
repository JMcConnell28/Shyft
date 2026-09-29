import { useQuery } from "@tanstack/react-query"

import { supportLocationsQueryOptions } from "@/features/support/query-options"

function useSupportLocations(organizationId: string) {
  return useQuery(supportLocationsQueryOptions(organizationId))
}

export { useSupportLocations }
