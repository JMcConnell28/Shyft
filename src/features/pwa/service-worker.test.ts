import { describe, expect, it } from "vitest"
import { createWorkerHarness } from "./service-worker-test-harness"

describe("public asset caching", () => {
  it("serves cached versioned assets without a network revalidation", async () => {
    const worker = createWorkerHarness()
    worker.cache.match.mockResolvedValue(new Response("cached"))
    const response = await worker.dispatch("fetch", "/assets/index-abcdefgh.js")
    expect(await response?.text()).toBe("cached")
    expect(worker.fetch).not.toHaveBeenCalled()
  })

  it("persists a missing hashed JavaScript chunk until its cache write finishes", async () => {
    const worker = createWorkerHarness()
    expect(
      await (
        await worker.dispatch("fetch", "/assets/route-abcdefgh.js")
      )?.text()
    ).toBe("network")
    expect(worker.cache.put).toHaveBeenCalledTimes(1)
  })

  it.each([
    "/api/auth/avatar",
    "/api/data",
    "/_server/fn",
    "/private/photo.png",
    "/assets/unversioned.js",
  ])(
    "leaves sensitive or unversioned requests outside the worker cache: %s",
    async (path) => {
      const worker = createWorkerHarness()
      expect(await worker.dispatch("fetch", path)).toBeUndefined()
      expect(worker.caches.open).not.toHaveBeenCalled()
      expect(worker.fetch).not.toHaveBeenCalled()
    }
  )

  it("always fetches navigation and does not store authenticated HTML", async () => {
    const worker = createWorkerHarness()
    await worker.dispatch("fetch", "/app/tenant/dashboard", "navigate")
    expect(worker.fetch).toHaveBeenCalledTimes(1)
    expect(worker.cache.put).not.toHaveBeenCalled()
  })

  it("enables navigation preload on activation when supported", async () => {
    const worker = createWorkerHarness()
    await worker.dispatch("activate")
    expect(worker.navigationPreload.enable).toHaveBeenCalledTimes(1)
  })

  it("still activates when navigation preload is unsupported", async () => {
    const worker = createWorkerHarness(false)
    await worker.dispatch("activate")
    expect(worker.navigationPreload.enable).not.toHaveBeenCalled()
  })

  it("uses preloaded authenticated HTML without a duplicate fetch or cache write", async () => {
    const worker = createWorkerHarness()
    const response = await worker.dispatch(
      "fetch",
      "/app/tenant/dashboard",
      "navigate",
      "GET",
      Promise.resolve(new Response("preloaded"))
    )
    expect(await response?.text()).toBe("preloaded")
    expect(worker.fetch).not.toHaveBeenCalled()
    expect(worker.cache.put).not.toHaveBeenCalled()
  })

  it("falls back to one ordinary fetch when navigation preload rejects", async () => {
    const worker = createWorkerHarness()
    const response = await worker.dispatch(
      "fetch",
      "/app/tenant/dashboard",
      "navigate",
      "GET",
      Promise.reject(new Error("Preload unavailable"))
    )
    expect(await response?.text()).toBe("network")
    expect(worker.fetch).toHaveBeenCalledTimes(1)
    expect(worker.cache.put).not.toHaveBeenCalled()
  })

  it("retains the offline page when both preload and ordinary fetch fail", async () => {
    const worker = createWorkerHarness()
    worker.fetch.mockRejectedValue(new Error("Offline"))
    worker.caches.match.mockResolvedValue(new Response("offline"))
    const response = await worker.dispatch("fetch", "/dashboard", "navigate")
    expect(await response?.text()).toBe("offline")
    expect(worker.cache.put).not.toHaveBeenCalled()
  })

  it("does not intercept mutations or cross-origin assets", async () => {
    const worker = createWorkerHarness()
    await worker.dispatch("fetch", "/assets/index-abcdefgh.js", "cors", "POST")
    await worker.dispatch(
      "fetch",
      "https://other.test/assets/index-abcdefgh.js"
    )
    expect(worker.caches.open).not.toHaveBeenCalled()
  })

  it("only removes obsolete RocketRota caches during activation", async () => {
    const worker = createWorkerHarness()
    await worker.dispatch("activate")
    expect(worker.caches.delete.mock.calls).toEqual([["rocketrota-pwa-v9"]])
  })
})
