import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { invalidateNavigationCache } from "@/features/navigation/invalidate-navigation-cache"

function NavigationCacheController() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Another tab may have changed the session or workspace while this tab
    // was inactive. Revalidate on the next navigation without polling.
    const invalidate = () => {
      void invalidateNavigationCache(queryClient)
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") invalidate()
    }

    window.addEventListener("focus", invalidate)
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      window.removeEventListener("focus", invalidate)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [queryClient])

  return null
}

export { NavigationCacheController }
