import { readFileSync } from "node:fs"
import { runInNewContext } from "node:vm"
import { vi } from "vitest"

type WorkerRequest = Pick<Request, "url" | "mode" | "method" | "destination">
type WorkerEvent = {
  preloadResponse?: Promise<Response | undefined>
  request: WorkerRequest
  respondWith: (response: Promise<Response | undefined>) => void
  waitUntil: (work: Promise<unknown>) => void
}

export function createWorkerHarness(supportsNavigationPreload = true) {
  const listeners = new Map<string, (event: WorkerEvent) => void>()
  const cache = {
    match: vi
      .fn<() => Promise<Response | undefined>>()
      .mockResolvedValue(undefined),
    put: vi.fn().mockResolvedValue(undefined),
    addAll: vi.fn().mockResolvedValue(undefined),
  }
  const fetch = vi
    .fn()
    .mockImplementation(() => Promise.resolve(new Response("network")))
  const caches = {
    open: vi.fn().mockResolvedValue(cache),
    match: vi.fn().mockResolvedValue(undefined),
    keys: vi
      .fn()
      .mockResolvedValue([
        "unrelated",
        "rocketrota-pwa-v9",
        "rocketrota-pwa-v10",
      ]),
    delete: vi.fn().mockResolvedValue(true),
  }
  const navigationPreload = { enable: vi.fn().mockResolvedValue(undefined) }
  runInNewContext(readFileSync("public/sw.js", "utf8"), {
    URL,
    Response,
    fetch,
    caches,
    console,
    self: {
      registration: {
        navigationPreload: supportsNavigationPreload
          ? navigationPreload
          : undefined,
      },
      location: { origin: "https://example.test" },
      addEventListener: (
        name: string,
        listener: (event: WorkerEvent) => void
      ) => listeners.set(name, listener),
      skipWaiting: vi.fn(),
      clients: { claim: vi.fn() },
    },
  })
  async function dispatch(
    name: string,
    path = "/",
    mode: RequestMode = "cors",
    method = "GET",
    preloadResponse?: Promise<Response | undefined>
  ) {
    let response: Promise<Response | undefined> | undefined
    const work: Array<Promise<unknown>> = []
    listeners.get(name)?.({
      preloadResponse,
      request: {
        url: new URL(path, "https://example.test").href,
        mode,
        method,
        destination: "",
      },
      respondWith: (value) => {
        response = value
      },
      waitUntil: (value) => {
        work.push(value)
      },
    })
    const result = await response
    await Promise.all(work)
    return result
  }
  return { cache, caches, fetch, dispatch, navigationPreload }
}
