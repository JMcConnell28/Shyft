import { useEffect, useRef } from "react"

import { isPerformanceProfilingEnabled } from "@/features/navigation/utils/profiling-enabled"

// Profile the first usable content, which may arrive after the route resolves.
function useContentReadyTiming(ready: boolean): void {
  const recorded = useRef(false)
  useEffect(() => {
    if (!isPerformanceProfilingEnabled || !ready || recorded.current) return
    recorded.current = true
    const navigation = performance.getEntriesByType("navigation").at(0)
    const documentTiming =
      navigation && "responseStart" in navigation ? navigation : undefined
    document.documentElement.dataset.performanceContentReady = "true"
    console.info(
      "[content-ready-timing]",
      JSON.stringify({
        destination: "dashboard",
        documentElapsedMs: Math.round(performance.now()),
        documentTtfbMs: documentTiming
          ? Math.round(Number(documentTiming.responseStart))
          : null,
        serverFunctionRequests: performance
          .getEntriesByType("resource")
          .filter((entry) => entry.name.includes("/_serverFn/")).length,
      })
    )
  }, [ready])
}

export { useContentReadyTiming }
