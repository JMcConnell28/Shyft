import { beforeEach, expect, it, vi } from "vitest"
import { getLocationFeatureAccess } from "./server-fns"

const { session, organization, orgRole, locationRole, locations, flags } =
  vi.hoisted(() => ({
    session: vi.fn(),
    organization: vi.fn(),
    orgRole: vi.fn(),
    locationRole: vi.fn(),
    locations: vi.fn(),
    flags: vi.fn(),
  }))
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    let validate = (input: unknown): unknown => input
    return {
      validator(fn: (input: unknown) => unknown) {
        validate = fn
        return this
      },
      handler(fn: (context: { data: unknown }) => unknown) {
        return (options: { data: unknown }) =>
          fn({ data: validate(options.data) })
      },
    }
  },
}))
vi.mock("@/features/onboarding/server/session", () => ({
  requireVerifiedSessionOrThrow: session,
}))
vi.mock("@/features/rota/server/lookups", () => ({
  getLocationOrganizationId: organization,
}))
vi.mock("@/lib/auth/has-org-permission", () => ({
  getOrganizationRole: orgRole,
}))
vi.mock("@/lib/auth/has-location-permission", () => ({
  getLocationRole: locationRole,
}))
vi.mock("@/features/rota/server/access", () => ({
  listPermittedRotaLocations: locations,
}))
vi.mock("./server/evaluation", () => ({ getLocationFeatureFlags: flags }))
const locationId = "00000000-0000-4000-8000-000000000001"
beforeEach(() => {
  vi.resetAllMocks()
  session.mockResolvedValue({ session: { user: { id: "user" } } })
  organization.mockResolvedValue("trusted-org")
  orgRole.mockResolvedValue("employee")
  locations.mockResolvedValue([{ id: locationId }])
  flags.mockResolvedValue({})
})
it("uses the location's actual organization and trusted membership before reading flags", async () => {
  await getLocationFeatureAccess({ data: { locationId } })
  expect(orgRole).toHaveBeenCalledWith("trusted-org", "user")
  expect(locations).toHaveBeenCalledWith(
    "trusted-org",
    "user",
    "employee",
    locationId
  )
  expect(flags).toHaveBeenCalledWith(locationId)
})
it("rejects another customer's location before reading its flags", async () => {
  orgRole.mockResolvedValue(null)
  await expect(
    getLocationFeatureAccess({ data: { locationId } })
  ).rejects.toThrow("access")
  expect(flags).not.toHaveBeenCalled()
  expect(locations).not.toHaveBeenCalled()
})
it("rejects a workspace member without access to the requested location", async () => {
  locations.mockResolvedValue([])
  await expect(
    getLocationFeatureAccess({ data: { locationId } })
  ).rejects.toThrow("access")
  expect(flags).not.toHaveBeenCalled()
})
it("supports standalone locations through location membership", async () => {
  organization.mockResolvedValue(null)
  locationRole.mockResolvedValue("owner")
  await getLocationFeatureAccess({ data: { locationId } })
  expect(locationRole).toHaveBeenCalledWith(locationId, "user")
  expect(orgRole).not.toHaveBeenCalled()
  expect(flags).toHaveBeenCalledWith(locationId)
})
