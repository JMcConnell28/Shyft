import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  getCustomerSupportThread,
  listCustomerSupportNotifications,
  listCustomerSupportThreads,
} from "@/features/support/server/queries"

const { query } = vi.hoisted(() => ({ query: vi.fn() }))

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))

const scope = {
  organizationId: "org-1",
  userId: "user-1",
  threadId: "thread-1",
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe("customer thread reads", () => {
  it("pages thread history without losing older requests", async () => {
    const rows = Array.from({ length: 26 }, (_, index) => ({
      id: `thread-${index}`,
      subject: "Question",
      category: "support",
      status: "open",
      updated_at: new Date("2026-01-01"),
      unread: false,
    }))
    query.mockResolvedValueOnce({ rows })
    const result = await listCustomerSupportThreads({
      organizationId: "org-1",
      userId: "user-1",
      page: 2,
    })
    expect(result.threads).toHaveLength(25)
    expect(result.hasMore).toBe(true)
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("limit 26 offset $3"),
      ["org-1", "user-1", 50]
    )
  })

  it("returns an unread count without loading the whole inbox", async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          id: "thread-1",
          subject: "Question",
          category: "support",
          status: "waiting",
          updated_at: new Date("2026-01-01"),
          unread: true,
          unread_count: "8",
        },
      ],
    })
    const result = await listCustomerSupportNotifications({
      organizationId: "org-1",
      userId: "user-1",
    })
    expect(result.unreadCount).toBe(8)
    expect(result.threads).toHaveLength(1)
    expect(query).toHaveBeenCalledWith(expect.stringContaining("limit 5"), [
      "org-1",
      "user-1",
    ])
  })

  it("requires requester and organization, then marks only the loaded messages read", async () => {
    query
      .mockResolvedValueOnce({
        rows: [
          {
            id: "thread-1",
            subject: "Question",
            category: "support",
            status: "waiting",
            updated_at: new Date("2026-01-01"),
            unread: false,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "message-1",
            author_type: "admin",
            body: "Answer",
            created_at: new Date("2026-01-01"),
            message_number: "18",
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] })

    const result = await getCustomerSupportThread(scope)
    expect(result.messages).toHaveLength(1)
    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("created_by_user_id = $3"),
      ["thread-1", "org-1", "user-1"]
    )
    expect(query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("support_thread_reads"),
      ["thread-1", "user-1", "18"]
    )
  })

  it("does not expose messages for another requester's thread", async () => {
    query.mockResolvedValueOnce({ rows: [] })
    await expect(getCustomerSupportThread(scope)).rejects.toThrow(
      "could not find"
    )
    expect(query).toHaveBeenCalledTimes(1)
  })
})
