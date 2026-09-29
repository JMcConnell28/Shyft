import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createCustomerSupportThread,
  replyToCustomerSupportThread,
} from "@/features/support/server/actions"

const { query, release } = vi.hoisted(() => ({
  query: vi.fn(),
  release: vi.fn(),
}))

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({
  getDatabase: () => ({ connect: () => Promise.resolve({ query, release }) }),
}))

beforeEach(() => {
  vi.resetAllMocks()
  query.mockResolvedValue({ rows: [] })
})

describe("support mutations", () => {
  it("creates a thread and its first message in one transaction", async () => {
    query.mockImplementation((sql: string) =>
      Promise.resolve(
        sql.includes("insert into admin_private.support_threads")
          ? { rows: [{ id: "thread-1" }] }
          : { rows: [] }
      )
    )
    await expect(
      createCustomerSupportThread({
        organizationId: "org-1",
        userId: "user-1",
        subject: "Question",
        category: "support",
        locationId: null,
        body: "How does this work?",
      })
    ).resolves.toEqual({ id: "thread-1" })
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("admin_private.support_messages"),
      ["thread-1", "user-1", "How does this work?"]
    )
    expect(query).toHaveBeenCalledWith("commit")
    expect(release).toHaveBeenCalledOnce()
  })

  it("checks that a selected location belongs to the workplace", async () => {
    query.mockImplementation((sql: string) =>
      Promise.resolve(
        sql.includes("from public.locations")
          ? { rows: [{ id: "location-1" }] }
          : sql.includes("insert into admin_private.support_threads")
            ? { rows: [{ id: "thread-1" }] }
            : { rows: [] }
      )
    )
    await createCustomerSupportThread({
      organizationId: "org-1",
      userId: "user-1",
      subject: "Question",
      category: "support",
      locationId: "location-1",
      body: "Help",
    })
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("organization_id = $2"),
      ["location-1", "org-1"]
    )
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("admin_private.support_threads"),
      ["user-1", "org-1", "location-1", "Question", "support"]
    )
  })

  it("rejects a location outside the workplace", async () => {
    await expect(
      createCustomerSupportThread({
        organizationId: "org-1",
        userId: "user-1",
        subject: "Question",
        category: "support",
        locationId: "location-2",
        body: "Help",
      })
    ).rejects.toThrow("valid workplace location")
    expect(query).toHaveBeenCalledWith("rollback")
  })

  it("reopens a resolved thread when its requester replies", async () => {
    query.mockImplementation((sql: string) =>
      Promise.resolve(
        sql.includes("for update")
          ? { rows: [{ id: "thread-1", status: "resolved" }] }
          : { rows: [] }
      )
    )
    await replyToCustomerSupportThread({
      organizationId: "org-1",
      threadId: "thread-1",
      userId: "user-1",
      body: "I still need help",
    })
    expect(query).toHaveBeenCalledWith(expect.stringContaining("for update"), [
      "thread-1",
      "org-1",
      "user-1",
    ])
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("status = 'open'"),
      ["thread-1"]
    )
    expect(query).toHaveBeenCalledWith("commit")
  })

  it("rolls back when the thread does not belong to the requester", async () => {
    await expect(
      replyToCustomerSupportThread({
        organizationId: "org-1",
        threadId: "other-thread",
        userId: "user-1",
        body: "Reply",
      })
    ).rejects.toThrow("active support request")
    expect(query).toHaveBeenCalledWith("rollback")
    expect(query).not.toHaveBeenCalledWith(
      expect.stringContaining("insert into admin_private.support_messages"),
      expect.anything()
    )
  })
})
