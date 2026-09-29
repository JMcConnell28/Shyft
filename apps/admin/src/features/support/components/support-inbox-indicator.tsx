import { Link, useLocation } from "@tanstack/react-router"
import { useEffect, useRef } from "react"

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
        <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-xs text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
      <span className="sr-only"> unread customer conversations</span>
    </Link>
  )
}

export { SupportInboxIndicator }
