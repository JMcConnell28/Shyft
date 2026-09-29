import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  replyToSupportThread,
  updateSupportThreadStatus,
} from "@/features/support/server/actions"
import {
  countUnreadSupportThreads,
  getSupportThreadDetail,
  listSupportThreads,
} from "@/features/support/server/queries"

const { queryMany, queryOne, query, release, audit } = vi.hoisted(() => ({
  queryMany: vi.fn(),
  queryOne: vi.fn(),
  query: vi.fn(),
  release: vi.fn(),
  audit: vi.fn(),
}))

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@rocketrota/db", () => ({
  queryMany,
  queryOne,
  getDatabase: () => ({
    query,
    connect: () => Promise.resolve({ query, release }),
  }),
}))
vi.mock("@/features/audit/server/audit-log", () => ({
  writeAdminAuditLog: audit,
}))

beforeEach(() => {
  vi.resetAllMocks()
  query.mockResolvedValue({ rows: [] })
  audit.mockResolvedValue(undefined)
})

describe("admin support", () => {
  it("pages the admin inbox", async () => {
    queryMany.mockResolvedValueOnce(
      Array.from({ length: 26 }, (_, index) => ({
        id: `thread-${index}`,
        subject: "Question",
        category: "support",
        priority: "normal",
        status: "open",
        created_at: new Date("2026-01-01"),
        updated_at: new Date("2026-01-01"),
        customer_name: "Alex Manager",
        organization_name: "Harbour Group",
        location_name: "North Branch",
        unread: false,
      }))
    )
    const result = await listSupportThreads("agent-1", 1)
    expect(result.threads).toHaveLength(25)
    expect(result.hasMore).toBe(true)
    expect(result.threads[0]).toMatchObject({
      customerName: "Alex Manager",
      organizationName: "Harbour Group",
      locationName: "North Branch",
    })
    expect(queryMany).toHaveBeenCalledWith(
      expect.stringContaining('left join public."organization"'),
      ["agent-1", 25]
    )
    expect(queryMany).toHaveBeenCalledWith(
      expect.stringContaining("limit 26 offset $2"),
      ["agent-1", 25]
    )
  })

  it("counts unread customer activity for the current staff member", async () => {
    queryOne.mockResolvedValue({ unread_count: "12" })
    await expect(countUnreadSupportThreads("agent-1")).resolves.toBe(12)
    expect(queryOne).toHaveBeenCalledWith(
      expect.stringContaining("message_number > coalesce"),
      ["agent-1"]
    )
  })

  it("tracks reads separately for each support staff member", async () => {
    const thread = {
      id: "thread-1",
      subject: "Question",
      category: "support",
      priority: "normal",
      status: "open",
      created_at: new Date("2026-01-01"),
      updated_at: new Date("2026-01-01"),
      customer_name: "Alex Manager",
      organization_name: "Harbour Group",
      location_name: null,
      unread: false,
    }
    const message = {
      id: "message-1",
      author_type: "user",
      body: "Help",
      created_at: new Date("2026-01-01"),
      message_number: "7",
    }
    queryMany
      .mockResolvedValueOnce([thread])
      .mockResolvedValueOnce([message])
      .mockResolvedValueOnce([thread])
      .mockResolvedValueOnce([message])

    await getSupportThreadDetail("thread-1", "agent-1")
    await getSupportThreadDetail("thread-1", "agent-2")

    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("support_thread_reads"),
      ["thread-1", "agent-1", "7"]
    )
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("support_thread_reads"),
      ["thread-1", "agent-2", "7"]
    )
  })

  it("records a reply and moves the thread to waiting", async () => {
    query.mockImplementation((sql: string) =>
      Promise.resolve(
        sql.includes("for update")
          ? { rows: [{ id: "thread-1" }] }
          : { rows: [] }
      )
    )
    await replyToSupportThread({
      id: "thread-1",
      adminUserId: "agent-1",
      body: "Answer",
    })
    expect(query).toHaveBeenCalledWith(expect.stringContaining("for update"), [
      "thread-1",
    ])
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("status = 'waiting'"),
      ["thread-1"]
    )
    expect(query).toHaveBeenCalledWith("commit")
  })

  it("resolves once and adds a customer-visible status message", async () => {
    query.mockImplementation((sql: string) =>
      Promise.resolve(
        sql.includes("for update")
          ? { rows: [{ status: "open" }] }
          : { rows: [] }
      )
    )
    await updateSupportThreadStatus({
      id: "thread-1",
      adminUserId: "agent-1",
      status: "resolved",
    })
    expect(query).toHaveBeenCalledWith(expect.stringContaining("'system'"), [
      "thread-1",
      "agent-1",
    ])
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("status = 'resolved'"),
      ["thread-1"]
    )
  })
})
