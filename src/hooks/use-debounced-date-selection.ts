"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { DATE_SELECTION_DEBOUNCE_MS } from "@/hooks/date-selection.constants"
import { showErrorToast } from "@/lib/toast"

type DebouncedDateSelection<T> = {
  selectedValue: T
  isPending: boolean
  updateSelection: (update: (previous: T) => T) => void
}

function useDebouncedDateSelection<T>({
  value,
  onChange,
  scopeKey,
  isEqual = Object.is,
}: {
  value: T
  onChange: (next: T) => void | Promise<void>
  scopeKey: string
  isEqual?: (first: T, second: T) => boolean
}): DebouncedDateSelection<T> {
  const [selectedValue, setSelectedValue] = useState(value)
  const selected = useRef(value)
  const source = useRef(value)
  const submitted = useRef(value)
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const onChangeRef = useRef(onChange)
  const scope = useRef(scopeKey)
  const revision = useRef(0)
  onChangeRef.current = onChange

  const cancel = useCallback(() => {
    window.clearTimeout(timeout.current)
    revision.current += 1
  }, [])

  useEffect(() => {
    const scopeChanged = scope.current !== scopeKey
    if (!scopeChanged && isEqual(source.current, value)) return
    source.current = value
    scope.current = scopeKey
    // A completed request must not overwrite clicks made while it was loading.
    if (!scopeChanged && isEqual(submitted.current, value)) return
    cancel()
    selected.current = value
    submitted.current = value
    setSelectedValue(value)
  }, [value, scopeKey, isEqual, cancel])

  useEffect(() => cancel, [cancel])

  useEffect(() => {
    function resetForHistoryChange() {
      cancel()
      selected.current = source.current
      submitted.current = source.current
      setSelectedValue(source.current)
    }
    window.addEventListener("popstate", resetForHistoryChange)
    return () => window.removeEventListener("popstate", resetForHistoryChange)
  }, [cancel])

  const updateSelection = useCallback(
    (update: (previous: T) => T) => {
      cancel()
      const next = update(selected.current)
      selected.current = next
      setSelectedValue(next)
      if (isEqual(next, submitted.current)) return
      const selectionRevision = revision.current
      timeout.current = setTimeout(() => {
        submitted.current = next
        const commit = onChangeRef.current
        Promise.resolve()
          .then(() => commit(next))
          .catch((error: unknown) => {
            if (revision.current !== selectionRevision) return
            selected.current = source.current
            submitted.current = source.current
            setSelectedValue(source.current)
            showErrorToast(error, {
              fallbackMessage: "We could not load the selected date.",
            })
          })
      }, DATE_SELECTION_DEBOUNCE_MS)
    },
    [cancel, isEqual]
  )

  return {
    selectedValue,
    isPending: !isEqual(selectedValue, value),
    updateSelection,
  }
}

export { useDebouncedDateSelection }
