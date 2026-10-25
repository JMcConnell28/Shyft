// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { getElapsedMilliseconds } from "../utils/elapsed-time"
import { useLiveNow } from "./use-live-now"

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe("live clock restoration", () => {
  it("shows elapsed time on the first render after the session arrives", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-25T09:00:00Z"))
    const { result, rerender } = renderHook(
      ({ enabled }) => useLiveNow(enabled),
      { initialProps: { enabled: false } }
    )
    vi.setSystemTime(new Date("2026-10-25T09:05:00Z"))
    rerender({ enabled: true })
    expect(getElapsedMilliseconds("2026-10-25T09:01:00Z", result.current)).toBe(
      240_000
    )
  })

  it("resynchronizes immediately when a suspended app regains focus", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-25T09:00:00Z"))
    const { result, unmount } = renderHook(() => useLiveNow())
    vi.setSystemTime(new Date("2026-10-25T10:00:00Z"))
    act(() => window.dispatchEvent(new Event("focus")))
    expect(result.current.toISOString()).toBe("2026-10-25T10:00:00.000Z")
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
