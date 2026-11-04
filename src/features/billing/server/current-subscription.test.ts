import { beforeEach, describe, expect, it, vi } from "vitest"

import { syncCurrentStripeSubscription } from "./current-subscription"

const { acquire, retrieve, release, persist } = vi.hoisted(() => ({
  acquire: vi.fn(),
  retrieve: vi.fn(),
  release: vi.fn(),
  persist: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("./processing-locks", () => ({ acquireBillingProcessingLock: acquire }))
vi.mock("./stripe", () => ({
  getStripe: () => ({ subscriptions: { retrieve } }),
}))
beforeEach(() => {
  vi.resetAllMocks()
  acquire.mockResolvedValue({ release, assertHeld: () => undefined })
  release.mockResolvedValue(undefined)
  persist.mockResolvedValue(undefined)
})

describe("authoritative subscription synchronization", () => {
  it("retrieves under the cross-worker lock and never persists an old event payload", async () => {
    retrieve.mockResolvedValue({ id: "sub_one", status: "canceled" })
    await syncCurrentStripeSubscription("sub_one", persist)
    expect(acquire).toHaveBeenCalledWith("subscription", "sub_one")
    expect(acquire.mock.invocationCallOrder[0]).toBeLessThan(
      retrieve.mock.invocationCallOrder[0]
    )
    expect(retrieve.mock.invocationCallOrder[0]).toBeLessThan(
      persist.mock.invocationCallOrder[0]
    )
    expect(persist).toHaveBeenCalledWith({ id: "sub_one", status: "canceled" })
    expect(release).toHaveBeenCalledOnce()
  })
  it("refuses racing writers and releases the lock on retrieval or persistence failure", async () => {
    acquire.mockResolvedValueOnce(null)
    await expect(
      syncCurrentStripeSubscription("sub_one", persist)
    ).rejects.toThrow("already running")
    expect(retrieve).not.toHaveBeenCalled()
    retrieve.mockRejectedValueOnce(new Error("Stripe unavailable"))
    await expect(
      syncCurrentStripeSubscription("sub_one", persist)
    ).rejects.toThrow("Stripe unavailable")
    expect(release).toHaveBeenCalledTimes(1)
    retrieve.mockResolvedValue({ id: "sub_one", status: "canceled" })
    persist.mockRejectedValueOnce(new Error("Database unavailable"))
    await expect(
      syncCurrentStripeSubscription("sub_one", persist)
    ).rejects.toThrow("Database unavailable")
    expect(release).toHaveBeenCalledTimes(2)
  })
})
