import { getRenderTiming, resetRenderTiming } from "./render-timing"
import { isPerformanceProfilingEnabled } from "./profiling-enabled"
import type { AnyRouter } from "@tanstack/react-router"

const navigationSections = [
  "dashboard",
  "rota",
  "timesheets",
  "time-clock",
  "settings",
] as const
type NavigationLabel =
  | (typeof navigationSections)[number]
  | "rota-editor"
  | "other"

function getNavigationLabel(pathname: string): NavigationLabel {
  const section =
    /^\/app\/[^/]+\/(dashboard|rota|timesheets|time-clock|settings)(?:\/|$)/.exec(
      pathname
    )?.[1]
  if (section === "rota" && /\/rota\/[^/]+\/[^/]+/.test(pathname)) {
    return "rota-editor"
  }
  return navigationSections.find((item) => item === section) ?? "other"
}

// Development-only timings start inside the app, excluding browser automation.
// Only section names and durations are recorded, never URLs or user data.
function installNavigationTiming(router: AnyRouter): void {
  if (!isPerformanceProfilingEnabled || typeof window === "undefined") return
  let startedAt = performance.now()
  let loadedAt = startedAt
  router.subscribe("onBeforeNavigate", () => {
    startedAt = performance.now()
    loadedAt = startedAt
    resetRenderTiming()
  })
  router.subscribe("onLoad", () => {
    loadedAt = performance.now()
  })
  router.subscribe("onResolved", ({ toLocation }) => {
    const observedResources = performance.getEntriesByType("resource")
    const resourceTimingAvailable = observedResources.length > 0
    const resources = observedResources
      .filter((entry) => entry.startTime + entry.duration >= startedAt)
      .filter(
        (entry): entry is PerformanceResourceTiming =>
          "initiatorType" in entry && "transferSize" in entry
      )
    const code = resources.filter((entry) =>
      /\.[cm]?[jt]sx?(?:\?|$)/.test(entry.name)
    )
    console.info(
      "[navigation-timing]",
      JSON.stringify({
        destination: getNavigationLabel(toLocation.pathname),
        documentElapsedMs: Math.round(performance.now()),
        loadMs: Math.round(loadedAt - startedAt),
        commitAfterLoadMs: Math.round(performance.now() - loadedAt),
        totalMs: Math.round(performance.now() - startedAt),
        reactRenderMs: getRenderTiming(),
        resourceTimingAvailable,
        codeRequests: resourceTimingAvailable ? code.length : null,
        codeTransferBytes: resourceTimingAvailable
          ? code.reduce((total, entry) => total + entry.transferSize, 0)
          : null,
        codeNetworkMs: resourceTimingAvailable
          ? Math.round(Math.max(0, ...code.map((entry) => entry.duration)))
          : null,
        serverRequests: resourceTimingAvailable
          ? resources.filter((entry) => entry.name.includes("/_serverFn/"))
              .length
          : null,
      })
    )
  })
}

export { getNavigationLabel, installNavigationTiming }
