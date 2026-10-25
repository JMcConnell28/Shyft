import { isPerformanceProfilingEnabled } from "./profiling-enabled"
import type { QueryClient } from "@tanstack/react-query"

function installQueryTiming(client: QueryClient): void {
  if (!isPerformanceProfilingEnabled || typeof window === "undefined") return
  const starts = new WeakMap<object, number>()
  client.getQueryCache().subscribe((event) => {
    if (event.type !== "updated") return
    if (event.action.type === "fetch")
      starts.set(event.query, performance.now())
    const start = starts.get(event.query)
    if (
      start === undefined ||
      !["success", "error"].includes(event.action.type)
    )
      return
    starts.delete(event.query)
    const operation = event.query.queryKey[1]
    console.info(
      "[query-timing]",
      JSON.stringify({
        scope: event.query.queryKey[0],
        operation:
          typeof operation === "string" &&
          [
            "session",
            "workspace",
            "list-page",
            "unread-updates",
            "access",
            "day",
            "attention",
            "page",
          ].includes(operation)
            ? operation
            : "query",
        durationMs: Math.round(performance.now() - start),
        status: event.action.type,
      })
    )
  })
}

export { installQueryTiming }
