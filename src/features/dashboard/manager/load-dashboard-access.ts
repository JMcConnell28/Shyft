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
  search: { location?: string; date?: string },
  { serverRendering = import.meta.env.SSR }: { serverRendering?: boolean } = {}
): Promise<void> {
  const access = await client.ensureQueryData(
    managerAccessOptions(organizationId, userId)
  )
  const location = search.location
    ? access.locations.find((item) => item.id === search.location)
    : access.locations[0]
  if (location) {
    const dayOptions = managerDayOptions(
      {
        organizationId,
        locationId: location.id,
        date: search.date,
      },
      userId
    )
    // Keep server HTML and its dehydrated staffing data on the same snapshot.
    // Client navigation can show the shell while the same query is in flight.
    if (serverRendering) await client.ensureQueryData(dayOptions)
    else void client.prefetchQuery(dayOptions)
  }
  if (!serverRendering) {
    void client.prefetchQuery(
      managerAttentionOptions(organizationId, 1, userId)
    )
  }
}

export { loadDashboardAccess }
