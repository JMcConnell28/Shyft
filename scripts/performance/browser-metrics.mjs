// Installed before navigation. Values contain durations/counts only.
export function observePage() {
  window.__performanceAudit = { lcpMs: null, cls: 0, longTasks: [] }
  const state = window.__performanceAudit
  const observe = (type, consume) => {
    if (!PerformanceObserver.supportedEntryTypes.includes(type)) return
    new PerformanceObserver((list) =>
      list.getEntries().forEach(consume)
    ).observe({ type, buffered: true })
  }
  observe("largest-contentful-paint", (entry) => {
    state.lcpMs = entry.startTime
  })
  // Session-window CLS, matching Web Vitals (1s gap / 5s maximum window).
  let windowStart = 0
  let previous = 0
  let score = 0
  observe("layout-shift", (entry) => {
    if (entry.hadRecentInput) return
    if (
      entry.startTime - previous > 1000 ||
      entry.startTime - windowStart > 5000
    ) {
      windowStart = entry.startTime
      score = 0
    }
    score += entry.value
    previous = entry.startTime
    state.cls = Math.max(state.cls, score)
  })
  observe("longtask", (entry) => {
    state.longTasks.push(entry.duration)
  })
}

export function readPageMetrics() {
  const navigation = performance.getEntriesByType("navigation")[0]
  const resources = performance.getEntriesByType("resource")
  const scripts = resources.filter((entry) =>
    new URL(entry.name).pathname.endsWith(".js")
  )
  return {
    status: document.querySelector('[role="alert"]')
      ? "inspect-alert"
      : "rendered",
    ttfbMs: navigation.responseStart - navigation.requestStart,
    domContentLoadedMs: navigation.domContentLoadedEventEnd,
    fcpMs:
      performance.getEntriesByName("first-contentful-paint")[0]?.startTime ??
      null,
    ...window.__performanceAudit,
    // This observation-window sum is NOT Lighthouse's TBT measurement.
    observedBlockingMs: window.__performanceAudit.longTasks.reduce(
      (total, duration) => total + Math.max(0, duration - 50),
      0
    ),
    jsTransferBytes: scripts.reduce(
      (total, entry) => total + entry.transferSize,
      0
    ),
    jsDecodedBytes: scripts.reduce(
      (total, entry) => total + entry.decodedBodySize,
      0
    ),
    resources: resources.length,
    serviceWorkerControlled: Boolean(navigator.serviceWorker?.controller),
    standalone: matchMedia("(display-mode: standalone)").matches,
  }
}
