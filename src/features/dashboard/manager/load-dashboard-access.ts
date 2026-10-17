import {
  managerAccessOptions,
  managerAttentionOptions,
  managerDayOptions,
} from "./query-options"
import type { QueryClient } from "@tanstack/react-query"

async function loadDashboardAccess(
  client: QueryClient,
  organizationId: string,
  userId: string,
  search: { location?: string; date?: string }
): Promise<void> {
  const access = await client.ensureQueryData(
    managerAccessOptions(organizationId, userId)
  )
  const location = search.location
    ? access.locations.find((item) => item.id === search.location)
    : access.locations[0]
  // Start the same queries the mounted dashboard uses as soon as access is known,
  // without waiting for the welcome preference or component code to finish.
  if (location) {
    void client.prefetchQuery(
      managerDayOptions(
        {
          organizationId,
          locationId: location.id,
          date: search.date,
        },
        userId
      )
    )
  }
  void client.prefetchQuery(managerAttentionOptions(organizationId, 1, userId))
}

export { loadDashboardAccess }
