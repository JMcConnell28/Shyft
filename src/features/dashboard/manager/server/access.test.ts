import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  requireDashboardLocation,
  resolveManagerDashboardAccess,
} from "./access"

const mock = vi.hoisted(() => ({
  session: vi.fn(),
  role: vi.fn(),
  locations: vi.fn(),
  query: vi.fn(),
  entitlements: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/features/onboarding/server/session", () => ({
  requireVerifiedSessionOrThrow: mock.session,
}))
vi.mock("@/lib/auth/has-org-permission", () => ({
  getOrganizationRole: mock.role,
}))
vi.mock("@/features/rota/server/access", () => ({
  listPermittedRotaLocations: mock.locations,
}))
vi.mock("@/features/billing/server/entitlements", () => ({
  listLocationEntitlements: mock.entitlements,
}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query: mock.query }) }))

beforeEach(() => {
  vi.resetAllMocks()
  mock.session.mockResolvedValue({
    session: {
      user: { id: "user-1" },
      session: { activeOrganizationId: "org-1" },
    },
  })
  mock.role.mockResolvedValue("manager")
  mock.locations.mockResolvedValue([{ id: "permitted" }])
  mock.query.mockResolvedValue({
    rows: [
      {
        id: "permitted",
        name: "Bar",
        slug: "bar",
        time_zone: "Europe/London",
        time_format: "12h",
        late_grace: 5,
      },
    ],
  })
  mock.entitlements.mockResolvedValue([
    { locationId: "permitted", canWrite: true, timeAttendanceEnabled: false },
  ])
})
describe("manager dashboard server access", () => {
  it("rejects a forged active organisation before reading any dashboard data", async () => {
    await expect(resolveManagerDashboardAccess("other-org")).rejects.toThrow(
      "active workspace"
    )
    expect(mock.query).not.toHaveBeenCalled()
    expect(mock.locations).not.toHaveBeenCalled()
  })
  it.each(["employee", "member", null])(
    "denies a non-manager role %s",
    async (role) => {
      mock.role.mockResolvedValue(role)
      await expect(resolveManagerDashboardAccess("org-1")).rejects.toThrow(
        "permission"
      )
      expect(mock.query).not.toHaveBeenCalled()
    }
  )
  it.each(["manager", "supervisor", "admin", "owner"])(
    "accepts management role %s and scopes the query to permitted locations",
    async (role) => {
      mock.role.mockResolvedValue(role)
      const data = await resolveManagerDashboardAccess("org-1")
      expect(data.locations).toHaveLength(1)
      expect(mock.query.mock.calls[0][1]).toEqual(["org-1", ["permitted"]])
      expect(data.locations[0].attendanceEnabled).toBe(false)
      expect(() =>
        requireDashboardLocation(data.locations, "outside-location")
      ).toThrow("manage")
    }
  )
  it("enables attendance only when the permitted location has the add-on", async () => {
    mock.entitlements.mockResolvedValue([
      { locationId: "permitted", canWrite: true, timeAttendanceEnabled: true },
    ])
    expect(
      (await resolveManagerDashboardAccess("org-1")).locations[0]
        .attendanceEnabled
    ).toBe(true)
  })
})
