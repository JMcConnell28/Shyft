"use client"

import { useEffect, useState } from "react"

import { DATE_SELECTION_DEBOUNCE_MS } from "@/hooks/date-selection.constants"

function useDebouncedValue<T>(
  value: T,
  delayMs = DATE_SELECTION_DEBOUNCE_MS
): T {
  const [settledValue, setSettledValue] = useState(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => setSettledValue(value), delayMs)
    return () => window.clearTimeout(timeout)
  }, [value, delayMs])

  return settledValue
}

export { useDebouncedValue }
