import "@tanstack/react-start/server-only"

import { getRequest, setResponseHeader } from "@tanstack/react-start/server"

type TimingName = "auth" | "supabase" | "membership" | "database" | "request"
type Timing = { count: number; duration: number }
const requestTimings = new WeakMap<Request, Map<TimingName, Timing>>()

async function timeServerOperation<T>(
  name: TimingName,
  operation: () => Promise<T>
): Promise<T> {
  if (!import.meta.env.DEV && process.env.PERFORMANCE_PROFILE !== "1")
    return operation()
  let request: Request
  try {
    request = getRequest()
  } catch {
    // Background tasks have no HTTP request to attach timings to.
    return operation()
  }
  const timings = requestTimings.get(request) ?? new Map<TimingName, Timing>()
  requestTimings.set(request, timings)
  const startedAt = performance.now()
  try {
    return await operation()
  } finally {
    const previous = timings.get(name)
    timings.set(name, {
      count: (previous?.count ?? 0) + 1,
      duration: (previous?.duration ?? 0) + performance.now() - startedAt,
    })
    setResponseHeader(
      "Server-Timing",
      [...timings]
        .map(
          ([key, value]) =>
            `${key};dur=${value.duration.toFixed(1)};desc="${value.count} calls"`
        )
        .join(", ")
    )
    console.info(
      "[operation-timing]",
      JSON.stringify({
        operation: name,
        durationMs: Math.round(performance.now() - startedAt),
      })
    )
  }
}

export { timeServerOperation }
