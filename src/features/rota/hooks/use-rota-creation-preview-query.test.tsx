// @vitest-environment jsdom
import { createElement } from "react"
import { act, cleanup, renderHook } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type * as React from "react"

import { useRotaCreationPreviewQuery } from "@/features/rota/hooks/use-rota-creation-preview-query"
import { DATE_SELECTION_DEBOUNCE_MS } from "@/hooks/date-selection.constants"

const { preview } = vi.hoisted(() => ({ preview: vi.fn() }))
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => preview }))
vi.mock("@/features/rota/server-fns", () => ({ previewRotaCreation: vi.fn() }))
vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const requireReact = createRequire(import.meta.url)
  const react: typeof React = requireReact("react")
  return { ...react, default: react }
})

beforeEach(() => {
  vi.useFakeTimers()
  preview.mockResolvedValue({
    existingRota: null,
    previousPublished: null,
    templates: [],
  })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe("rota creation previews", () => {
  it("fetches only the final week when selection changes quickly", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const { result, rerender, unmount } = renderHook(
      ({ weekStart }) =>
        useRotaCreationPreviewQuery({
          enabled: true,
          locationId: "loc",
          weekStart,
        }),
      {
        initialProps: { weekStart: "2026-06-01" },
        wrapper: ({ children }) =>
          createElement(QueryClientProvider, { client }, children),
      }
    )
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(preview).toHaveBeenCalledTimes(1)
    rerender({ weekStart: "2026-06-08" })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })
    rerender({ weekStart: "2026-06-15" })
    expect(result.current.isSelectingWeek).toBe(true)
    expect(preview).toHaveBeenCalledTimes(1)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DATE_SELECTION_DEBOUNCE_MS)
    })
    expect(preview).toHaveBeenCalledTimes(2)
    expect(preview).toHaveBeenLastCalledWith({
      data: { locationId: "loc", weekStart: "2026-06-15" },
    })
    unmount()
    client.clear()
  })
})
