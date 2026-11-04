import { beforeEach, describe, expect, it, vi } from "vitest"

const { permission, read, generate } = vi.hoisted(() => ({
  permission: vi.fn(),
  read: vi.fn(),
  generate: vi.fn(),
}))
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    let validate = (input: unknown): unknown => input
    return {
      validator(fn: (input: unknown) => unknown) {
        validate = fn
        return this
      },
      handler(fn: (context: { data: unknown }) => unknown) {
        return (options: { data?: unknown } = {}) =>
          fn({ data: validate(options.data) })
      },
    }
  },
}))
vi.mock("@/features/auth/server/admin-session", () => ({
  requireAdminPermission: permission,
}))
vi.mock("./server/queries", () => ({ getClockStationsPageData: read }))
vi.mock("./server/actions", () => ({ generateClockStationTag: generate }))

const locationId = "00000000-0000-4000-8000-000000000001"
beforeEach(() => vi.resetAllMocks())

describe("operator NFC provisioning permissions", () => {
  it("blocks setup reads before database access without clock_stations.manage", async () => {
    permission.mockRejectedValue(new Error("Permission denied"))
    const { getClockStations } = await import("./server-fns")
    await expect(getClockStations()).rejects.toThrow("Permission denied")
    expect(permission).toHaveBeenCalledWith("clock_stations.manage")
    expect(read).not.toHaveBeenCalled()
  })

  it("blocks key generation without clock_stations.manage", async () => {
    permission.mockRejectedValue(new Error("Permission denied"))
    const { generateClockStationTagServerFn } = await import("./server-fns")
    await expect(
      generateClockStationTagServerFn({ data: { locationId } })
    ).rejects.toThrow("Permission denied")
    expect(permission).toHaveBeenCalledWith("clock_stations.manage")
    expect(generate).not.toHaveBeenCalled()
  })

  it("retains setup reads for an authorized operator", async () => {
    permission.mockResolvedValue({ membership: { userId: "operator" } })
    read.mockResolvedValue({ locations: [], tags: [] })
    const { getClockStations } = await import("./server-fns")
    await expect(getClockStations()).resolves.toEqual({
      locations: [],
      tags: [],
    })
    expect(permission).toHaveBeenCalledWith("clock_stations.manage")
    expect(read).toHaveBeenCalledOnce()
  })

  it("uses the authenticated operator identity for key generation", async () => {
    permission.mockResolvedValue({ membership: { userId: "operator" } })
    generate.mockResolvedValue({ id: "tag" })
    const { generateClockStationTagServerFn } = await import("./server-fns")
    await generateClockStationTagServerFn({ data: { locationId } })
    expect(generate).toHaveBeenCalledWith({
      locationId,
      adminUserId: "operator",
    })
  })
})
