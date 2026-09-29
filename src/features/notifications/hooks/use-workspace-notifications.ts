import { useQuery } from "@tanstack/react-query"
import { useLocation } from "@tanstack/react-router"
import { useEffect, useRef } from "react"

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
  const pathname = useLocation({ select: (location) => location.pathname })
  const previousPathname = useRef(pathname)
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
    if (previousPathname.current !== pathname && scope.canUseSupport) {
      void support.refetch()
    }
    previousPathname.current = pathname
  }, [pathname, scope.canUseSupport, support.refetch])

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
