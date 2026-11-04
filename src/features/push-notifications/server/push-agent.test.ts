import { beforeEach, describe, expect, it, vi } from "vitest"
import { createPushAgent, isPublicPushAddress } from "./push-agent"
import type { LookupAddress, LookupOptions } from "node:dns"

const { lookup } = vi.hoisted(() => ({ lookup: vi.fn() }))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("node:dns/promises", () => ({ lookup }))
beforeEach(() => vi.resetAllMocks())

function resolveThroughAgent(
  host = "fcm.googleapis.com",
  options: LookupOptions = { all: true },
  signal = new AbortController().signal
) {
  const agent = createPushAgent("fcm.googleapis.com", signal)
  expect(agent.options.rejectUnauthorized).toBe(true)
  expect(agent.options.checkServerIdentity).toBeUndefined()
  const lookupSocket = agent.options.lookup
  if (!lookupSocket) throw new Error("The socket must use a checked resolver.")
  return new Promise<string | Array<LookupAddress>>((resolve, reject) => {
    lookupSocket(host, options, (error, address) => {
      agent.destroy()
      if (error) reject(error)
      else resolve(address)
    })
  })
}

describe("public push destination addresses", () => {
  it.each(["8.8.8.8", "142.250.74.10", "17.188.1.1", "2607:f8b0:4001:c1b::5f"])(
    "accepts public address %s",
    (value) => {
      expect(isPublicPushAddress(value)).toBe(true)
    }
  )
  it.each([
    "127.0.0.1",
    "0.0.0.0",
    "0.1.2.3",
    "10.0.0.1",
    "172.16.0.1",
    "192.168.1.1",
    "100.64.0.1",
    "169.254.169.254",
    "192.0.0.1",
    "192.0.2.1",
    "198.18.0.1",
    "198.51.100.1",
    "203.0.113.1",
    "224.0.0.1",
    "255.255.255.255",
    "::",
    "::1",
    "fc00::1",
    "fe80::1",
    "ff02::1",
    "::ffff:127.0.0.1",
    "64:ff9b::7f00:1",
    "2002:7f00:1::",
    "2001:db8::1",
    "2001::1",
    "3fff::1",
    "4000::1",
    "2607:f8b0::1%eth0",
    "not-an-ip",
  ])("rejects private, reserved or transition address %s", (value) => {
    expect(isPublicPushAddress(value)).toBe(false)
  })
})

describe("push socket DNS checks", () => {
  it("does not hand an address to a socket after the request deadline", async () => {
    const controller = new AbortController()
    let finishLookup: ((addresses: Array<LookupAddress>) => void) | undefined
    lookup.mockImplementation(
      () =>
        new Promise<Array<LookupAddress>>((resolve) => {
          finishLookup = resolve
        })
    )
    const result = resolveThroughAgent(
      "fcm.googleapis.com",
      { all: true },
      controller.signal
    )
    controller.abort()
    if (!finishLookup) throw new Error("The lookup was not started.")
    finishLookup([{ address: "8.8.8.8", family: 4 }])
    await expect(result).rejects.toThrow("timed out")
  })
  it("passes the actual checked addresses to the socket without resolving twice", async () => {
    const addresses = [
      { address: "8.8.8.8", family: 4 },
      { address: "2607:f8b0::1", family: 6 },
    ]
    lookup
      .mockResolvedValueOnce(addresses)
      .mockResolvedValueOnce([{ address: "127.0.0.1", family: 4 }])
    expect(await resolveThroughAgent()).toEqual(addresses)
    expect(lookup).toHaveBeenCalledTimes(1)
  })
  it("supports the single-address lookup callback", async () => {
    lookup.mockResolvedValue([{ address: "8.8.8.8", family: 4 }])
    expect(await resolveThroughAgent("fcm.googleapis.com", { family: 4 })).toBe(
      "8.8.8.8"
    )
  })
  it("rejects a response containing a mix of public and private addresses", async () => {
    lookup.mockResolvedValue([
      { address: "8.8.8.8", family: 4 },
      { address: "::1", family: 6 },
    ])
    await expect(resolveThroughAgent()).rejects.toThrow("public addresses")
  })
  it("checks every new connection rather than trusting an earlier DNS answer", async () => {
    lookup
      .mockResolvedValueOnce([{ address: "8.8.8.8", family: 4 }])
      .mockResolvedValueOnce([{ address: "10.0.0.1", family: 4 }])
    await expect(resolveThroughAgent()).resolves.toHaveLength(1)
    await expect(resolveThroughAgent()).rejects.toThrow("public addresses")
  })
  it("refuses a different hostname before DNS is contacted", async () => {
    await expect(resolveThroughAgent("localhost")).rejects.toThrow("refused")
    expect(lookup).not.toHaveBeenCalled()
  })
  it("fails closed on an empty or failed lookup", async () => {
    lookup
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error("DNS unavailable"))
    await expect(resolveThroughAgent()).rejects.toThrow("public addresses")
    await expect(resolveThroughAgent()).rejects.toThrow("lookup failed")
  })
})
