// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type * as React from "react"

import { useDebouncedDateSelection } from "@/hooks/use-debounced-date-selection"
import { DATE_SELECTION_DEBOUNCE_MS } from "@/hooks/date-selection.constants"

const { showError } = vi.hoisted(() => ({ showError: vi.fn() }))
vi.mock("@/lib/toast", () => ({ showErrorToast: showError }))
vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const requireReact = createRequire(import.meta.url)
  const react: typeof React = requireReact("react")
  return { ...react, default: react }
})

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.clearAllMocks()
})

async function settleSelection() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(DATE_SELECTION_DEBOUNCE_MS)
  })
}

describe("debounced date selection", () => {
  it("updates immediately and commits only the final selection after a quiet interval", async () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useDebouncedDateSelection({ value: 1, scopeKey: "org", onChange })
    )
    act(() => {
      result.current.updateSelection((value) => value + 1)
      result.current.updateSelection((value) => value + 1)
    })
    expect(result.current.selectedValue).toBe(3)
    expect(result.current.isPending).toBe(true)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DATE_SELECTION_DEBOUNCE_MS - 1)
    })
    expect(onChange).not.toHaveBeenCalled()
    act(() => result.current.updateSelection((value) => value + 1))
    await settleSelection()
    expect(onChange).toHaveBeenCalledExactlyOnceWith(4)
  })

  it("makes no request when the user returns to the loaded date", async () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useDebouncedDateSelection({ value: 1, scopeKey: "org", onChange })
    )
    act(() => {
      result.current.updateSelection(() => 2)
      result.current.updateSelection(() => 1)
    })
    await settleSelection()
    expect(onChange).not.toHaveBeenCalled()
    expect(result.current.isPending).toBe(false)
  })

  it("preserves newer clicks when an earlier date finishes loading", async () => {
    const onChange = vi.fn()
    const { result, rerender } = renderHook(
      ({ value }) =>
        useDebouncedDateSelection({ value, scopeKey: "org", onChange }),
      { initialProps: { value: 1 } }
    )
    act(() => result.current.updateSelection(() => 2))
    await settleSelection()
    act(() => result.current.updateSelection(() => 3))
    rerender({ value: 2 })
    expect(result.current.selectedValue).toBe(3)
    await settleSelection()
    expect(onChange.mock.calls).toEqual([[2], [3]])
    rerender({ value: 3 })
    expect(result.current.isPending).toBe(false)
  })

  it("synchronizes browser back and cancels pending selection", async () => {
    const onChange = vi.fn()
    const { result, rerender } = renderHook(
      ({ value }) =>
        useDebouncedDateSelection({ value, scopeKey: "org", onChange }),
      { initialProps: { value: 2 } }
    )
    act(() => result.current.updateSelection(() => 3))
    rerender({ value: 1 })
    await settleSelection()
    expect(result.current.selectedValue).toBe(1)
    expect(onChange).not.toHaveBeenCalled()
  })

  it("cancels on workspace changes and unmount", async () => {
    const onChange = vi.fn()
    const { result, rerender, unmount } = renderHook(
      ({ scopeKey }) =>
        useDebouncedDateSelection({ value: 1, scopeKey, onChange }),
      { initialProps: { scopeKey: "first" } }
    )
    act(() => result.current.updateSelection(() => 2))
    rerender({ scopeKey: "second" })
    expect(result.current.selectedValue).toBe(1)
    await settleSelection()
    expect(onChange).not.toHaveBeenCalled()
    act(() => result.current.updateSelection(() => 3))
    unmount()
    await settleSelection()
    expect(onChange).not.toHaveBeenCalled()
  })

  it("cancels a queued date on browser back even before the loaded data changes", async () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useDebouncedDateSelection({ value: 1, scopeKey: "org", onChange })
    )
    act(() => result.current.updateSelection(() => 2))
    act(() => window.dispatchEvent(new PopStateEvent("popstate")))
    await settleSelection()
    expect(result.current.selectedValue).toBe(1)
    expect(onChange).not.toHaveBeenCalled()
  })

  it("restores the loaded selection on navigation errors", async () => {
    const onChange = vi.fn().mockRejectedValue(new Error("Unavailable"))
    const { result } = renderHook(() =>
      useDebouncedDateSelection({ value: 1, scopeKey: "org", onChange })
    )
    act(() => result.current.updateSelection(() => 2))
    await settleSelection()
    expect(result.current.selectedValue).toBe(1)
    expect(showError).toHaveBeenCalledOnce()
  })

  it("ignores errors from an earlier request after a new date is selected", async () => {
    let reject: ((error: Error) => void) | undefined
    const onChange = vi.fn(
      () =>
        new Promise<void>((_, rejectPromise) => {
          reject = rejectPromise
        })
    )
    const { result } = renderHook(() =>
      useDebouncedDateSelection({ value: 1, scopeKey: "org", onChange })
    )
    act(() => result.current.updateSelection(() => 2))
    await settleSelection()
    act(() => result.current.updateSelection(() => 3))
    await act(async () => {
      reject?.(new Error("Earlier request failed"))
      await Promise.resolve()
    })
    expect(result.current.selectedValue).toBe(3)
    expect(showError).not.toHaveBeenCalled()
  })
})
