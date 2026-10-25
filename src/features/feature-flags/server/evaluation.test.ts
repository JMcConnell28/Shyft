import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { query } = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))
beforeEach(() => {
  vi.resetModules()
  query.mockReset()
  vi.useFakeTimers()
  vi.setSystemTime(new Date("2026-10-24T12:00:00Z"))
})
afterEach(() => vi.useRealTimers())
const disabled = {
  key: "rota.templates",
  is_enabled: false,
  default_value: true,
  location_value: true,
}
describe("server flag evaluation", () => {
  it("batches flags and deduplicates concurrent reads for a location", async () => {
    query.mockResolvedValue({ rows: [disabled] })
    const { getLocationFeatureFlags } = await import("./evaluation")
    const [a, b] = await Promise.all([
      getLocationFeatureFlags("location"),
      getLocationFeatureFlags("location"),
    ])
    expect(a["rota.templates"].enabled).toBe(false)
    expect(b).toEqual(a)
    expect(query).toHaveBeenCalledTimes(1)
  })
  it("isolates decisions by location and refreshes expired snapshots", async () => {
    query
      .mockResolvedValueOnce({ rows: [disabled] })
      .mockResolvedValue({ rows: [] })
    const { getLocationFeatureFlags } = await import("./evaluation")
    expect((await getLocationFeatureFlags("a"))["rota.templates"].enabled).toBe(
      false
    )
    expect((await getLocationFeatureFlags("b"))["rota.templates"].enabled).toBe(
      true
    )
    vi.setSystemTime(new Date("2026-10-24T12:00:11Z"))
    expect((await getLocationFeatureFlags("a"))["rota.templates"].enabled).toBe(
      true
    )
  })
  it("retains a known disable during an outage instead of enabling it", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      query
        .mockResolvedValueOnce({ rows: [disabled] })
        .mockRejectedValue(new Error("offline"))
      const { getLocationFeatureFlags, requireLocationFeature } =
        await import("./evaluation")
      await getLocationFeatureFlags("a")
      vi.setSystemTime(new Date("2026-10-24T12:00:11Z"))
      await expect(
        requireLocationFeature("rota.templates", "a")
      ).rejects.toThrow("unavailable")
    } finally {
      log.mockRestore()
    }
  })
  it("does not treat a string false as a truthy boolean", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      query.mockResolvedValueOnce({ rows: [disabled] }).mockResolvedValue({
        rows: [{ ...disabled, is_enabled: true, location_value: "false" }],
      })
      const { getLocationFeatureFlags } = await import("./evaluation")
      await getLocationFeatureFlags("a")
      vi.setSystemTime(new Date("2026-10-24T12:00:11Z"))
      expect(
        (await getLocationFeatureFlags("a"))["rota.templates"].enabled
      ).toBe(false)
    } finally {
      log.mockRestore()
    }
  })
})
