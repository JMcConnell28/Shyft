import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocation } from "@tanstack/react-router"
import { useEffect } from "react"

import { dashboardAnnouncementsQueryOptions } from "@/features/announcements/query-options"
import { rotaQueryKeys } from "@/features/rota/query-keys"
import { getHasUnreadRotaUpdates } from "@/features/rota/server-fns"
import { supportNotificationsQueryOptions } from "@/features/support/query-options"

type WorkspaceNotificationScope = {
  organizationId: string
  userId: string
  canUseSupport: boolean
}

function useWorkspaceNotifications(scope: WorkspaceNotificationScope) {
  const queryClient = useQueryClient()
  const pathname = useLocation({ select: (location) => location.pathname })
  const announcements = useQuery(dashboardAnnouncementsQueryOptions(scope))
  const rotaUpdates = useQuery({
    queryKey: rotaQueryKeys.unreadUpdates(scope),
    queryFn: () => getHasUnreadRotaUpdates({ data: scope }),
  })
  const support = useQuery({
    ...supportNotificationsQueryOptions(scope.organizationId),
    enabled: scope.canUseSupport,
  })

  useEffect(() => {
    if (!scope.canUseSupport) return
    // Reuse fresh notifications on navigation instead of forcing a request.
    // The query renders failures and still refreshes on focus and mutations.
    void queryClient.prefetchQuery(
      supportNotificationsQueryOptions(scope.organizationId)
    )
  }, [pathname, queryClient, scope.canUseSupport, scope.organizationId])

  return {
    hasError: announcements.isError || rotaUpdates.isError || support.isError,
    hasUnreadAnnouncements: (announcements.data?.unreadCount ?? 0) > 0,
    hasUnreadRotaUpdates: rotaUpdates.data ?? false,
    isLoading:
      announcements.isPending ||
      rotaUpdates.isPending ||
      (scope.canUseSupport && support.isPending),
    recentAnnouncements: announcements.data?.announcements ?? [],
    supportNotifications: scope.canUseSupport
      ? (support.data?.threads ?? [])
      : [],
    supportUnreadCount: scope.canUseSupport
      ? (support.data?.unreadCount ?? 0)
      : 0,
  }
}

export { useWorkspaceNotifications }
