// Opt in only for a local production profiling build, never a normal release.
export const isPerformanceProfilingEnabled =
  import.meta.env.DEV || import.meta.env.VITE_PERFORMANCE_PROFILE === "true"
