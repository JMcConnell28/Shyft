import { queryOptions } from "@tanstack/react-query"

import type { AnnouncementScopeInput } from "@/features/announcements/types"
import { announcementQueryKeys } from "@/features/announcements/query-keys"
import { getDashboardAnnouncements } from "@/features/announcements/server-fns"

function dashboardAnnouncementsQueryOptions(input: AnnouncementScopeInput) {
  return queryOptions({
    queryKey: announcementQueryKeys.dashboard(input),
    queryFn: () => getDashboardAnnouncements({ data: input }),
  })
}

export { dashboardAnnouncementsQueryOptions }
