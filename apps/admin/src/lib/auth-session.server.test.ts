import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  readAdminSession,
  requireAdminSession,
} from "@/lib/auth-session.server"
import {
  requireAdminMembership,
  requireAdminPermission,
} from "@/features/auth/server/admin-session"

const { getSession, queryOne, query } = vi.hoisted(() => ({
  getSession: vi.fn(),
  queryOne: vi.fn(),
  query: vi.fn(),
}))

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@tanstack/react-start/server", () => ({
  getRequestHeaders: () => new Headers(),
}))
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession } } }))
vi.mock("@rocketrota/db", () => ({ queryOne, getDatabase: () => ({ query }) }))

const session = {
  user: { id: "admin-1", role: "owner" },
  session: { id: "session-1" },
}
const membershipRow = {
  user_id: "admin-1",
  email: "operator@example.test",
  name: "Operator",
  role: "readonly",
  disabled_at: null,
}

beforeEach(() => {
  vi.resetAllMocks()
  getSession.mockResolvedValue(session)
  queryOne.mockResolvedValue(membershipRow)
  query.mockResolvedValue({ rows: [] })
})

describe("admin session authorisation", () => {
  it("keeps active admins signed in and reads their current database role", async () => {
    await expect(readAdminSession()).resolves.toEqual(session)
    await expect(requireAdminSession()).resolves.toMatchObject({
      membership: { userId: "admin-1", role: "readonly" },
      session,
    })
    expect(query).not.toHaveBeenCalled()
  })

  it("denies a permission even when an older session still claims owner", async () => {
    await expect(requireAdminPermission("users.manage")).rejects.toThrow(
      "permission"
    )
    await expect(requireAdminPermission("audit.read")).resolves.toMatchObject({
      membership: { role: "readonly" },
    })
  })

  it("returns no optional session for a disabled admin, allowing the login page to render", async () => {
    queryOne.mockResolvedValue({ ...membershipRow, disabled_at: new Date() })
    await expect(readAdminSession()).resolves.toBeNull()
    expect(query).toHaveBeenCalledWith(
      'delete from admin_private.admin_session where "userId" = $1',
      ["admin-1"]
    )
  })

  it("rejects an existing session and revokes all of that disabled admin's sessions", async () => {
    queryOne.mockResolvedValue({ ...membershipRow, disabled_at: new Date() })
    await expect(requireAdminSession()).rejects.toThrow("Unauthorized")
    expect(query).toHaveBeenCalledWith(
      'delete from admin_private.admin_session where "userId" = $1',
      ["admin-1"]
    )
  })

  it("rejects disabled admins at the new-session membership boundary too", async () => {
    queryOne.mockResolvedValue({ ...membershipRow, disabled_at: new Date() })
    await expect(requireAdminMembership("admin-1")).rejects.toThrow("disabled")
    expect(query).toHaveBeenCalledTimes(1)
  })

  it("rechecks status when an account is disabled after an earlier request", async () => {
    queryOne
      .mockResolvedValueOnce(membershipRow)
      .mockResolvedValueOnce({ ...membershipRow, disabled_at: new Date() })
    await expect(requireAdminSession()).resolves.toMatchObject({
      membership: { role: "readonly" },
    })
    await expect(requireAdminSession()).rejects.toThrow("Unauthorized")
  })

  it("rejects signed-out and unprovisioned users", async () => {
    getSession.mockResolvedValue(null)
    await expect(readAdminSession()).resolves.toBeNull()
    await expect(requireAdminSession()).rejects.toThrow("Unauthorized")
    expect(queryOne).not.toHaveBeenCalled()
    getSession.mockResolvedValue(session)
    queryOne.mockResolvedValue(null)
    await expect(requireAdminSession()).rejects.toThrow("not been provisioned")
  })

  it("fails closed if membership lookup or session revocation fails", async () => {
    queryOne.mockRejectedValueOnce(new Error("Membership unavailable"))
    await expect(requireAdminSession()).rejects.toThrow(
      "Membership unavailable"
    )
    queryOne.mockResolvedValue({ ...membershipRow, disabled_at: new Date() })
    query.mockRejectedValueOnce(new Error("Revocation unavailable"))
    await expect(requireAdminSession()).rejects.toThrow(
      "Revocation unavailable"
    )
  })
})
