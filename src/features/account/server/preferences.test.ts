import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  getAccountPreferences,
  updateAccountPreferences,
} from "@/features/account/server/preferences"

const { query, requireSession } = vi.hoisted(() => ({
  query: vi.fn(),
  requireSession: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))
vi.mock("@/features/onboarding/server/session", () => ({
  requireVerifiedSessionOrThrow: requireSession,
}))

beforeEach(() => {
  vi.resetAllMocks()
  requireSession.mockResolvedValue({
    session: { user: { id: "signed-in-user" } },
  })
})

describe("account preferences", () => {
  it("enables announcement pushes for an account without saved preferences", async () => {
    query.mockResolvedValue({ rows: [] })
    await expect(getAccountPreferences()).resolves.toEqual({
      announcementPushEnabled: true,
    })
  })

  it("preserves an explicit opt-out", async () => {
    query.mockResolvedValue({ rows: [{ announcementPushEnabled: false }] })
    await expect(getAccountPreferences()).resolves.toEqual({
      announcementPushEnabled: false,
    })
  })

  it("saves preferences only for the signed-in user", async () => {
    query.mockResolvedValue({ rows: [{ announcementPushEnabled: false }] })
    await expect(
      updateAccountPreferences({ announcementPushEnabled: false })
    ).resolves.toEqual({ announcementPushEnabled: false })
    expect(query.mock.calls[0][1]).toEqual(["signed-in-user", false])
  })

  it("does not access preferences without a verified session", async () => {
    requireSession.mockRejectedValue(new Error("Unauthorized"))
    await expect(
      updateAccountPreferences({ announcementPushEnabled: false })
    ).rejects.toThrow("Unauthorized")
    expect(query).not.toHaveBeenCalled()
  })

  it("rejects malformed saved data instead of silently enabling notifications", async () => {
    query.mockResolvedValue({ rows: [{ announcementPushEnabled: "false" }] })
    await expect(getAccountPreferences()).rejects.toThrow()
  })
})
