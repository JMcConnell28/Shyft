// @vitest-environment jsdom
import * as React from "react"
import { cleanup, renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { getDefaultFeatureFlags } from "@rocketrota/shared/feature-flags"
import { afterEach, beforeEach, expect, it, vi } from "vitest"

import { useLocationFeatureFlags } from "./use-location-feature-flags"
import type { LocationFeatureFlags } from "@rocketrota/shared/feature-flags/types"

const { getAccess } = vi.hoisted(() => ({ getAccess: vi.fn() }))
vi.mock("../server-fns", () => ({ getLocationFeatureAccess: getAccess }))
vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const requireReact = createRequire(import.meta.url)
  const react: typeof React = requireReact("react")
  return { ...react, default: react }
})

const clients: Array<QueryClient> = []

function renderFlags(locationId = "location-a", enabled = true) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  clients.push(client)
  const hook = renderHook(
    ({ locationId: id, enabled: active }) =>
      useLocationFeatureFlags(id, active),
    {
      initialProps: { locationId, enabled },
      wrapper: ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client }, children),
    }
  )
  return { ...hook, client }
}

beforeEach(() => vi.resetAllMocks())
afterEach(() => {
  cleanup()
  clients.splice(0).forEach((client) => client.clear())
})

it("keeps budget controls hidden until the location confirms they are enabled", async () => {
  let resolveAccess: (flags: LocationFeatureFlags) => void = () => {}
  getAccess.mockReturnValue(
    new Promise<LocationFeatureFlags>((resolve) => {
      resolveAccess = resolve
    })
  )
  const { result } = renderFlags()
  expect(result.current["rota.budget_manager"].enabled).toBe(false)

  resolveAccess(getDefaultFeatureFlags())
  await waitFor(() => {
    expect(result.current["rota.budget_manager"].enabled).toBe(true)
  })
})

it("uses the disabled location decision after flags load", async () => {
  const flags = getDefaultFeatureFlags()
  flags["rota.budget_manager"] = { enabled: false, source: "global_off" }
  getAccess.mockResolvedValue(flags)
  const { result, client } = renderFlags()
  await waitFor(() => {
    expect(client.getQueryState(["feature-access", "location-a"])?.status).toBe(
      "success"
    )
  })
  expect(result.current["rota.budget_manager"].enabled).toBe(false)
})

it("hides budget access when a refresh receives a disabled flag", async () => {
  getAccess.mockResolvedValueOnce(getDefaultFeatureFlags())
  const { result, client } = renderFlags()
  await waitFor(() => {
    expect(result.current["rota.budget_manager"].enabled).toBe(true)
  })

  const flags = getDefaultFeatureFlags()
  flags["rota.budget_manager"] = { enabled: false, source: "global_off" }
  getAccess.mockResolvedValue(flags)
  await client.invalidateQueries({ queryKey: ["feature-access", "location-a"] })
  await waitFor(() => {
    expect(result.current["rota.budget_manager"].enabled).toBe(false)
  })
})

it("keeps budget controls hidden when the flag request fails", async () => {
  getAccess.mockRejectedValue(new Error("Flag request failed"))
  const { result, client } = renderFlags()
  await waitFor(() => {
    expect(client.getQueryState(["feature-access", "location-a"])?.status).toBe(
      "error"
    )
  })
  expect(result.current["rota.budget_manager"].enabled).toBe(false)
})

it("does not carry enabled budget access into an unresolved location", async () => {
  getAccess
    .mockResolvedValueOnce(getDefaultFeatureFlags())
    .mockReturnValue(new Promise<LocationFeatureFlags>(() => {}))
  const { result, rerender } = renderFlags()
  await waitFor(() => {
    expect(result.current["rota.budget_manager"].enabled).toBe(true)
  })
  rerender({ locationId: "location-b", enabled: true })
  expect(result.current["rota.budget_manager"].enabled).toBe(false)
})

it("preserves local demo defaults without a server request", () => {
  const { result } = renderFlags("demo-location", false)
  expect(result.current["rota.budget_manager"].enabled).toBe(true)
  expect(getAccess).not.toHaveBeenCalled()
})
