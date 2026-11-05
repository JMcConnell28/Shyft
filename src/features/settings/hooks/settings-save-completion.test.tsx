// @vitest-environment jsdom
import * as React from "react"
import { act, cleanup, renderHook } from "@testing-library/react"
import {
  QueryClient,
  QueryClientProvider,
  QueryObserver,
} from "@tanstack/react-query"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { useLocationSettingsMutations } from "./use-location-settings-mutations"
import { useZoneSettingsMutations } from "./use-zone-settings-mutations"

const mocks = vi.hoisted(() => ({
  createLocation: vi.fn(),
  createZone: vi.fn(),
  updateZone: vi.fn(),
  deleteZone: vi.fn(),
  success: vi.fn(),
}))
vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const react: typeof React = createRequire(import.meta.url)("react")
  return { ...react, default: react }
})
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }))
vi.mock("@/features/settings/server-fns", () => mocks)
vi.mock("@/lib/toast", () => ({
  showSuccessToast: mocks.success,
  showErrorToast: vi.fn(),
}))
const clients: Array<QueryClient> = []
beforeEach(() => vi.resetAllMocks())
afterEach(() => {
  cleanup()
  clients.splice(0).forEach((client) => client.clear())
})

it.each(["zone", "location"] as const)(
  "finishes a confirmed %s save without refetching unread rotas or requiring a router reload",
  async (kind) => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    })
    clients.push(client)
    const scope = { organizationId: "org", userId: "user" }
    const unread = vi.fn(() => new Promise<boolean>(() => {}))
    const key = ["rota", "unread-updates", scope]
    client.setQueryData(key, false)
    const observer = new QueryObserver(client, {
      queryKey: key,
      queryFn: unread,
      staleTime: Infinity,
    })
    const unsubscribe = observer.subscribe(() => {})
    mocks.createZone.mockResolvedValue({
      id: "zone",
      locationId: "location",
      name: "Kitchen",
      sortOrder: 0,
    })
    mocks.createLocation.mockResolvedValue({
      id: "location",
      name: "Cafe",
      slug: "cafe",
      zones: [],
      zoneCount: 0,
      employeeCount: 0,
      daySettings: [],
      address: null,
      estimatedClosingTime: "23:00",
      estimatedClosingTimeNextDay: false,
    })
    // No router provider: successful writes must not invalidate the whole route.
    const { result } = renderHook(
      () => ({
        zone: useZoneSettingsMutations(scope),
        location: useLocationSettingsMutations(scope),
      }),
      {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        ),
      }
    )
    await act(async () => {
      if (kind === "zone")
        await result.current.zone.createMutation.mutateAsync({
          locationId: "location",
          name: "Kitchen",
        })
      else
        await result.current.location.createMutation.mutateAsync({
          name: "Cafe",
          businessType: "hospitality",
          planningMode: "fixed_location",
          zoneNames: ["Main"],
          worksiteName: "",
        })
    })
    expect(result.current[kind].createMutation.isPending).toBe(false)
    expect(unread).not.toHaveBeenCalled()
    expect(mocks.success).toHaveBeenCalledOnce()
    unsubscribe()
  }
)
