import { Link, useLocation } from "@tanstack/react-router"
import { useEffect, useRef } from "react"

import { Badge } from "@panelui/badge"
import { useSupportUnreadCount } from "@/features/support/hooks/use-support-unread-count"

function SupportInboxIndicator() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const previousPathname = useRef(pathname)
  const query = useSupportUnreadCount()
  const unreadCount = query.data ?? 0

  useEffect(() => {
    if (previousPathname.current !== pathname) void query.refetch()
    previousPathname.current = pathname
  }, [pathname, query.refetch])

  return (
    <Link
      to="/support"
      className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
    >
      Support{" "}
      {unreadCount > 0 ? (
        <Badge variant="info" size="sm" className="ml-1">
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      ) : null}
      <span className="sr-only"> unread customer conversations</span>
    </Link>
  )
}

export { SupportInboxIndicator }
