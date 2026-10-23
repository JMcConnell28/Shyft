import { beforeEach, describe, expect, it, vi } from "vitest"
import { sendPendingStationAlerts } from "./station-alerts"

const { query, send } = vi.hoisted(() => ({ query: vi.fn(), send: vi.fn() }))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))
vi.mock("@/lib/email", () => ({ sendTransactionalEmail: send }))
vi.mock("@/lib/env.server", () => ({ getOptionalEnv: () => undefined }))

describe("station admin alerts", () => {
  beforeEach(() => {
    query.mockReset()
    send.mockReset()
    send.mockResolvedValue(undefined)
  })
  it("sends only to the configured operator and uses a stable deduplication key", async () => {
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            request_id: "included:location",
            location_id: "location",
            location_name: "Harbour House",
            customer_name: "Customer",
            customer_id: "org:customer",
          },
        ],
      })
      .mockResolvedValue({ rows: [] })
    await sendPendingStationAlerts()
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "jackmcconnell99@gmail.com",
        idempotencyKey: "station-needed/included:location",
      })
    )
    expect(query.mock.calls[2]?.[0]).toContain("email_sent_at = now()")
  })
  it("does not send again when the alert has already been claimed or sent", async () => {
    query.mockResolvedValue({ rows: [] })
    await sendPendingStationAlerts()
    expect(send).not.toHaveBeenCalled()
    expect(query.mock.calls[1]?.[0]).toContain("alert.email_sent_at is null")
  })
  it("keeps a failed email retryable without failing payment processing", async () => {
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            request_id: "included:location",
            location_id: "location",
            location_name: "Venue",
            customer_name: "Customer",
            customer_id: "org:customer",
          },
        ],
      })
      .mockResolvedValue({ rows: [] })
    send.mockRejectedValue(new Error("Mail outage"))
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      await expect(sendPendingStationAlerts()).resolves.toBeUndefined()
      expect(query.mock.calls[2]?.[0]).toContain("email_error")
      expect(query.mock.calls[2]?.[0]).not.toContain("email_sent_at = now()")
    } finally {
      log.mockRestore()
    }
  })
})
