import { beforeEach, describe, expect, it, vi } from "vitest"

import { createAnnouncement } from "@/features/announcements/server/actions"

const { query, transaction, sendPush } = vi.hoisted(() => ({
  query: vi.fn(),
  transaction: vi.fn(),
  sendPush: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/features/announcements/server/shared", () => ({
  getAnnouncementContext: () => ({
    organizationId: "org",
    userId: "author",
    role: "owner",
  }),
  listAnnouncementManageableLocations: () => [],
  withAnnouncementTransaction: transaction,
}))
vi.mock("@/features/announcements/server/queries", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))
vi.mock("@/features/announcements/server/push-notifications", () => ({
  sendAnnouncementPushNotifications: sendPush,
}))

const input = {
  organizationId: "org",
  userId: "author",
  title: "Announcement",
  body: "Body",
  targetScope: "organization" as const,
  targetLocationIds: [],
  isPinned: false,
  pollOptions: [],
}

beforeEach(() => vi.resetAllMocks())

describe("announcement creation", () => {
  it("sends push notifications only after the transaction commits", async () => {
    let committed = false
    query.mockResolvedValue({ rows: [{ id: "announcement" }] })
    transaction.mockImplementation(
      async (
        callback: (client: { query: typeof query }) => Promise<unknown>
      ) => {
        const result = await callback({ query })
        expect(sendPush).not.toHaveBeenCalled()
        committed = true
        return result
      }
    )
    sendPush.mockImplementation(() => {
      expect(committed).toBe(true)
    })
    await expect(createAnnouncement(input)).resolves.toEqual({
      announcementId: "announcement",
    })
    expect(sendPush).toHaveBeenCalledWith("announcement")
  })

  it("never sends notifications for a failed transaction", async () => {
    transaction.mockRejectedValue(new Error("Commit failed"))
    await expect(createAnnouncement(input)).rejects.toThrow("Commit failed")
    expect(sendPush).not.toHaveBeenCalled()
  })
})
