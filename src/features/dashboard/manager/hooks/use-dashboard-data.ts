import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  managerAccessOptions,
  managerAttentionOptions,
  managerDayOptions,
} from "../query-options"

function useDashboardData(
  organizationId: string,
  userId: string,
  search: { location?: string; date?: string }
) {
  const access = useQuery(managerAccessOptions(organizationId, userId))
  const location = search.location
    ? access.data?.locations.find((item) => item.id === search.location)
    : access.data?.locations[0]
  const [attentionPage, setAttentionPage] = useState(1)
  const day = useQuery({
    ...managerDayOptions(
      { organizationId, locationId: location?.id ?? "", date: search.date },
      userId
    ),
    enabled: Boolean(location),
  })
  const attention = useQuery({
    ...managerAttentionOptions(organizationId, attentionPage, userId),
    enabled: Boolean(access.data),
  })
  return { access, location, day, attention, setAttentionPage }
}
export { useDashboardData }
