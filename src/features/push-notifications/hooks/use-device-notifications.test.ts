// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type * as React from "react"

import { useDeviceNotifications } from "@/features/push-notifications/hooks/use-device-notifications"

const mocks = vi.hoisted(() => ({
  readStatus: vi.fn(),
  readConfig: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
  createSubscription: vi.fn(),
  errorToast: vi.fn(),
  successToast: vi.fn(),
}))
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }))
// Share the React instance used by Testing Library's CommonJS renderer.
vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const requireReact = createRequire(import.meta.url)
  const react: typeof React = requireReact("react")
  return { ...react, default: react }
})
vi.mock("@/features/push-notifications/server-fns", () => ({
  getPushPublicConfig: mocks.readConfig,
  getPushSubscriptionStatus: mocks.readStatus,
  savePushSubscription: mocks.save,
  removePushSubscription: mocks.remove,
}))
vi.mock("@/features/push-notifications/utils/push-browser", () => ({
  getPushSupport: () => ({ notifications: true, supported: true }),
  isIosDevice: () => false,
  isStandaloneDisplayMode: () => false,
}))
vi.mock("@/features/push-notifications/utils/device-push-subscription", () => ({
  createDevicePushSubscription: mocks.createSubscription,
  getDevicePushSubscriptionInput: () => ({
    subscription: { endpoint: "device-endpoint" },
  }),
}))
vi.mock("@/lib/toast", () => ({
  showErrorToast: mocks.errorToast,
  showSuccessToast: mocks.successToast,
}))

type TestSubscription = {
  endpoint: string
  unsubscribe: () => Promise<boolean>
}
let currentSubscription: TestSubscription | null
const unsubscribe = vi.fn<() => Promise<boolean>>()
const subscription = { endpoint: "device-endpoint", unsubscribe }

beforeEach(() => {
  vi.resetAllMocks()
  currentSubscription = subscription
  unsubscribe.mockImplementation(() => {
    currentSubscription = null
    return Promise.resolve(true)
  })
  mocks.readStatus.mockResolvedValue({ active: true })
  mocks.readConfig.mockResolvedValue({ publicKey: "public-key" })
  mocks.createSubscription.mockImplementation(() => {
    currentSubscription = subscription
    return Promise.resolve(subscription)
  })
  vi.stubGlobal("Notification", { permission: "granted" })
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {
      getRegistration: () =>
        Promise.resolve({
          pushManager: {
            getSubscription: () => Promise.resolve(currentSubscription),
          },
        }),
    },
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("device notification toggle", () => {
  it("loads the current subscription and turns it off without recreating it", async () => {
    const { result } = renderHook(useDeviceNotifications)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.checked).toBe(true)
    await act(() => result.current.setEnabled(false))
    expect(mocks.remove).toHaveBeenCalledWith({
      data: { endpoint: "device-endpoint" },
    })
    expect(unsubscribe).toHaveBeenCalledOnce()
    expect(result.current.checked).toBe(false)
    expect(mocks.save).not.toHaveBeenCalled()
  })

  it("subscribes and saves the device when turned on", async () => {
    currentSubscription = null
    const { result } = renderHook(useDeviceNotifications)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.checked).toBe(false)
    await act(() => result.current.setEnabled(true))
    expect(mocks.createSubscription).toHaveBeenCalledWith("public-key")
    expect(mocks.save).toHaveBeenCalledOnce()
    expect(result.current.checked).toBe(true)
  })

  it("restores the toggle and reports failed removal", async () => {
    mocks.remove.mockRejectedValue(new Error("Server unavailable"))
    const { result } = renderHook(useDeviceNotifications)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(() => result.current.setEnabled(false))
    expect(unsubscribe).not.toHaveBeenCalled()
    expect(result.current.checked).toBe(true)
    expect(result.current.isPending).toBe(false)
    expect(mocks.errorToast).toHaveBeenCalledOnce()
    expect(mocks.successToast).not.toHaveBeenCalled()
  })

  it("keeps the toggle off and exposes a server sync error", async () => {
    mocks.readStatus.mockResolvedValue({ active: false })
    mocks.save.mockRejectedValue(new Error("Sync failed"))
    const { result } = renderHook(useDeviceNotifications)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.checked).toBe(false)
    expect(result.current.state.error).toBe("Sync failed")
  })
})
