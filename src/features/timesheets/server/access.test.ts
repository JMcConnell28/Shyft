import { beforeEach, expect, it, vi } from "vitest"
import { resolveTimesheetAccess } from "./access"
import { updateTimesheetEntry } from "./actions"
import { getSageTimesheetExportData } from "./sage-export"
import { getOrganizationRole } from "@/lib/auth/has-org-permission"
import { getLocationRole } from "@/lib/auth/has-location-permission"

const { query } = vi.hoisted(() => ({ query: vi.fn() }))

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/features/onboarding/server/session", () => ({
  requireVerifiedSessionOrThrow: () =>
    Promise.resolve({ session: { user: { id: "supervisor" } } }),
}))
vi.mock("@/features/time-clock/server/shared", () => ({
  assertCurrentUser: vi.fn(),
}))
vi.mock("@/lib/auth/has-org-permission", () => ({
  getOrganizationRole: vi.fn(),
}))
vi.mock("@/lib/auth/has-location-permission", () => ({
  getLocationRole: vi.fn(),
}))
vi.mock("@/features/rota/server/access", () => ({
  listPermittedRotaLocations: () =>
    Promise.resolve([{ id: "location", name: "Main" }]),
}))
vi.mock("@/features/billing/server/entitlements", () => ({
  requireLocationPaidWriteAccess: vi.fn(),
}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getOrganizationRole).mockResolvedValue("supervisor")
  vi.mocked(getLocationRole).mockResolvedValue("supervisor")
})

it("returns personal-only access for an organization supervisor", async () => {
  expect(
    await resolveTimesheetAccess({
      organizationId: "org",
      userId: "supervisor",
    })
  ).toMatchObject({ canManage: false })
})
it("returns personal-only access for a location supervisor", async () => {
  query.mockResolvedValue({ rows: [{ id: "location", name: "Main" }] })
  expect(
    await resolveTimesheetAccess({
      locationId: "location",
      userId: "supervisor",
    })
  ).toMatchObject({ canManage: false })
})
it("blocks supervisor edits before opening a database transaction", async () => {
  await expect(
    updateTimesheetEntry({
      organizationId: "org",
      userId: "supervisor",
      entryId: "entry",
      clockedInAt: "2026-11-06T09:00:00Z",
      clockedOutAt: null,
      payableStartAt: "2026-11-06T09:00:00Z",
      payableEndAt: null,
      status: "open",
      reason: "Correction",
    })
  ).rejects.toThrow("permission to edit")
  expect(query).not.toHaveBeenCalled()
})
it("blocks supervisor payroll exports before reading team records", async () => {
  await expect(
    getSageTimesheetExportData({
      organizationId: "org",
      userId: "supervisor",
      weekStart: "2026-10-26",
      exportLocationId: "location",
    })
  ).rejects.toThrow("permission to export")
  expect(query).not.toHaveBeenCalled()
})
