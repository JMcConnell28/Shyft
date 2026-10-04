// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import type * as React from "react"
import { useBillingPortal } from "@/features/billing/hooks/use-billing-portal"

const { startPortal, showError } = vi.hoisted(() => ({
  startPortal: vi.fn(),
  showError: vi.fn(),
}))
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => startPortal }))
vi.mock("@/features/billing/server-fns", () => ({
  startBillingPortal: vi.fn(),
}))
vi.mock("@/lib/toast", () => ({ showErrorToast: showError }))
vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const requireReact = createRequire(import.meta.url)
  const react: typeof React = requireReact("react")
  return { ...react, default: react }
})
afterEach(() => {
  cleanup()
  vi.resetAllMocks()
  vi.unstubAllGlobals()
})

describe("billing portal navigation", () => {
  it("shows progress immediately, prevents repeated requests, and resets after redirect and browser back", async () => {
    let finish: ((value: { portalUrl: string }) => void) | undefined
    startPortal.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve
        })
    )
    const assign = vi.fn()
    const events = new EventTarget()
    vi.stubGlobal("window", {
      location: { pathname: "/app/shack/settings/billing", assign },
      addEventListener: events.addEventListener.bind(events),
      removeEventListener: events.removeEventListener.bind(events),
    })
    const { result } = renderHook(() =>
      useBillingPortal({ organizationId: "org-1" })
    )
    let navigation: Promise<void> | undefined
    act(() => {
      navigation = result.current.openPortal()
    })
    expect(result.current.isOpening).toBe(true)
    await act(async () => result.current.openPortal())
    expect(startPortal).toHaveBeenCalledTimes(1)
    await act(async () => {
      finish?.({ portalUrl: "https://billing.stripe.com/test" })
      await navigation
    })
    expect(assign).toHaveBeenCalledWith("https://billing.stripe.com/test")
    expect(result.current.isOpening).toBe(false)
    act(() => {
      void result.current.openPortal()
    })
    expect(result.current.isOpening).toBe(true)
    act(() => events.dispatchEvent(new Event("pageshow")))
    expect(result.current.isOpening).toBe(false)
    await act(async () => {
      finish?.({ portalUrl: "https://billing.stripe.com/test" })
      await Promise.resolve()
    })
  })
  it("resets and shows an error when Stripe cannot open", async () => {
    startPortal.mockRejectedValue(new Error("Stripe unavailable"))
    const { result } = renderHook(() =>
      useBillingPortal({ locationId: "loc-1" })
    )
    await act(async () => result.current.openPortal())
    expect(result.current.isOpening).toBe(false)
    expect(showError).toHaveBeenCalledOnce()
  })
})
