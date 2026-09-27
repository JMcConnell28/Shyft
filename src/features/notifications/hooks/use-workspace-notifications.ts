import { useQuery } from "@tanstack/react-query"

import { dashboardAnnouncementsQueryOptions } from "@/features/announcements/query-options"
import { rotaQueryKeys } from "@/features/rota/query-keys"
import { getHasUnreadRotaUpdates } from "@/features/rota/server-fns"

type WorkspaceNotificationScope = {
  organizationId: string
  userId: string
}

function useWorkspaceNotifications(scope: WorkspaceNotificationScope) {
  const announcements = useQuery(dashboardAnnouncementsQueryOptions(scope))
  const rotaUpdates = useQuery({
    queryKey: rotaQueryKeys.unreadUpdates(scope),
    queryFn: () => getHasUnreadRotaUpdates({ data: scope }),
  })

  return {
    hasError: announcements.isError || rotaUpdates.isError,
    hasUnreadAnnouncements: (announcements.data?.unreadCount ?? 0) > 0,
    hasUnreadRotaUpdates: rotaUpdates.data ?? false,
    isLoading: announcements.isPending || rotaUpdates.isPending,
    recentAnnouncements: announcements.data?.announcements ?? [],
  }
}

export { useWorkspaceNotifications }
