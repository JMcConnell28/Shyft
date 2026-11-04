import { beforeEach, describe, expect, it, vi } from "vitest"
import { upsertPushSubscription } from "./save-subscription"

const { query, connect, release } = vi.hoisted(() => ({
  query: vi.fn(),
  connect: vi.fn(),
  release: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ connect }) }))
const input = {
  userId: "user",
  subscription: {
    endpoint: "https://fcm.googleapis.com/fcm/send/device",
    keys: { auth: "abcdefgh", p256dh: "abcdefghijklmnopqrstuvwxyz" },
  },
}

beforeEach(() => {
  vi.resetAllMocks()
  connect.mockResolvedValue({ query, release })
  query.mockImplementation((sql: string) =>
    Promise.resolve(
      sql.includes("active_count")
        ? { rows: [{ active_count: 9 }] }
        : { rowCount: 1, rows: [] }
    )
  )
})

describe("push subscription registration limits", () => {
  it("rejects an unsafe endpoint before opening a database connection", async () => {
    await expect(
      upsertPushSubscription({
        ...input,
        subscription: { ...input.subscription, endpoint: "https://127.0.0.1/" },
      })
    ).rejects.toThrow()
    expect(connect).not.toHaveBeenCalled()
  })
  it("saves below the cap with a transaction lock before counting", async () => {
    await upsertPushSubscription(input)
    const calls = query.mock.calls.map((call) => String(call[0]))
    expect(
      calls.findIndex((sql) => sql.includes("pg_advisory_xact_lock"))
    ).toBeLessThan(calls.findIndex((sql) => sql.includes("active_count")))
    expect(calls.some((sql) => sql.includes("insert into"))).toBe(true)
    expect(query).toHaveBeenLastCalledWith("commit")
    expect(release).toHaveBeenCalledOnce()
  })
  it("rejects another device at the cap without inserting", async () => {
    query.mockImplementation((sql: string) =>
      Promise.resolve(
        sql.includes("active_count")
          ? { rows: [{ active_count: 10 }] }
          : { rows: [] }
      )
    )
    await expect(upsertPushSubscription(input)).rejects.toThrow("device limit")
    expect(
      query.mock.calls.some((call) => String(call[0]).includes("insert into"))
    ).toBe(false)
    expect(query).toHaveBeenLastCalledWith("rollback")
    expect(release).toHaveBeenCalledOnce()
  })
  it("rolls back when the endpoint belongs to another account", async () => {
    query.mockImplementation((sql: string) =>
      Promise.resolve(
        sql.includes("active_count")
          ? { rows: [{ active_count: 0 }] }
          : { rowCount: 0, rows: [] }
      )
    )
    await expect(upsertPushSubscription(input)).rejects.toThrow(
      "another account"
    )
    expect(query).toHaveBeenLastCalledWith("rollback")
    expect(release).toHaveBeenCalledOnce()
  })
  it("rolls back and releases the connection after a database failure", async () => {
    query
      .mockRejectedValueOnce(new Error("Database unavailable"))
      .mockResolvedValue({ rows: [] })
    await expect(upsertPushSubscription(input)).rejects.toThrow(
      "Database unavailable"
    )
    expect(release).toHaveBeenCalledOnce()
  })
})
