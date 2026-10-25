"use client"

import * as React from "react"

function useLiveNow(enabled = true, intervalMs = 1000) {
  const [, tick] = React.useReducer((value: number) => value + 1, 0)

  React.useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const refresh = () => tick()
    const intervalId = window.setInterval(refresh, intervalMs)
    window.addEventListener("focus", refresh)
    document.addEventListener("visibilitychange", refresh)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("focus", refresh)
      document.removeEventListener("visibilitychange", refresh)
    }
  }, [enabled, intervalMs])

  // Derive from the wall clock on every render, including the render in which
  // a fetched open entry first enables the timer. A disabled timer's old state
  // must never make a newer authoritative clock-in timestamp appear as zero.
  return new Date()
}

export { useLiveNow }
