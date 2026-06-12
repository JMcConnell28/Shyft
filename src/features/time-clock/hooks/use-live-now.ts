"use client"

import * as React from "react"

function useLiveNow(enabled = true, intervalMs = 1000) {
  const [now, setNow] = React.useState(() => new Date())

  React.useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setNow(new Date())
    }, intervalMs)

    return () => window.clearInterval(intervalId)
  }, [enabled, intervalMs])

  return now
}

export { useLiveNow }
