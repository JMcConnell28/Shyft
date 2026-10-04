// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import type * as React from "react"
import type { WorkspaceZone } from "@/features/rota/types/workspace"
import { useRotaZoneSelection } from "@/features/rota/hooks/use-rota-zone-selection"

vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const requireReact = createRequire(import.meta.url)
  const react: typeof React = requireReact("react")
  return { ...react, default: react }
})
afterEach(cleanup)

const zones: Array<WorkspaceZone> = [
  { id: "floor", name: "Floor" },
  { id: "bar", name: "Bar" },
]
const props: Parameters<typeof useRotaZoneSelection>[0] = {
  rotaId: "rota",
  defaultZoneId: null,
  zones,
}

describe("rota zone selection", () => {
  it("starts with the first zone when a default has not been set", () => {
    const { result } = renderHook(() => useRotaZoneSelection(props))
    expect(result.current.selectedZoneId).toBe("floor")
  })

  it("opens with the zone configured in settings", () => {
    const { result } = renderHook(() =>
      useRotaZoneSelection({ ...props, defaultZoneId: "bar" })
    )
    expect(result.current.selectedZoneId).toBe("bar")
  })

  it("keeps a chosen zone through refreshed board data but resets when another rota opens", () => {
    const { result, rerender } = renderHook(useRotaZoneSelection, {
      initialProps: props,
    })
    act(() => result.current.setSelectedZoneId("bar"))
    rerender({ ...props, zones: zones.map((zone) => ({ ...zone })) })
    expect(result.current.selectedZoneId).toBe("bar")
    rerender({ ...props, rotaId: "another-rota" })
    expect(result.current.selectedZoneId).toBe("floor")
  })

  it("applies a new default from settings", () => {
    const { result, rerender } = renderHook(useRotaZoneSelection, {
      initialProps: props,
    })
    rerender({ ...props, defaultZoneId: "bar" })
    expect(result.current.selectedZoneId).toBe("bar")
  })

  it("falls back when a chosen zone disappears and ignores invalid selections", () => {
    const { result, rerender } = renderHook(useRotaZoneSelection, {
      initialProps: props,
    })
    act(() => result.current.setSelectedZoneId("bar"))
    rerender({ ...props, zones: [zones[0]] })
    expect(result.current.selectedZoneId).toBe("floor")
    act(() => result.current.setSelectedZoneId("all"))
    expect(result.current.selectedZoneId).toBe("floor")
    rerender(props)
    expect(result.current.selectedZoneId).toBe("floor")
  })

  it("prefers an active zone over an archived default", () => {
    const { result } = renderHook(() =>
      useRotaZoneSelection({
        ...props,
        defaultZoneId: "floor",
        zones: [{ ...zones[0], isDeleted: true }, zones[1]],
      })
    )
    expect(result.current.selectedZoneId).toBe("bar")
  })

  it("still allows viewing a historical rota with only archived zones", () => {
    const { result } = renderHook(() =>
      useRotaZoneSelection({
        ...props,
        zones: [{ ...zones[0], isDeleted: true }],
      })
    )
    expect(result.current.selectedZoneId).toBe("floor")
  })

  it("handles a location without any zones", () => {
    const { result } = renderHook(() =>
      useRotaZoneSelection({ ...props, zones: [] })
    )
    expect(result.current.selectedZoneId).toBeNull()
  })
})
