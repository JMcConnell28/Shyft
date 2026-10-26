import { beforeEach, expect, it, vi } from "vitest"
import { getDefaultFeatureFlags } from "@rocketrota/shared/feature-flags"
import {
  canImportSageEmployees,
  requireSageEmployeeImportAccess,
} from "./sage-import-access"

const { query, flags } = vi.hoisted(() => ({ query: vi.fn(), flags: vi.fn() }))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))
vi.mock("@/features/feature-flags/server/evaluation", () => ({
  getLocationFeatureFlags: flags,
}))
const scope = {
  organizationId: "trusted-business",
  locationId: null,
  userId: "admin",
}
beforeEach(() => {
  vi.resetAllMocks()
  query.mockResolvedValue({
    rows: [{ id: "location-a" }, { id: "location-b" }],
  })
  flags.mockResolvedValue(getDefaultFeatureFlags())
})
it("allows a company import when every company location is enabled", async () => {
  expect(await canImportSageEmployees(scope)).toBe(true)
  expect(query).toHaveBeenCalledWith(expect.any(String), ["trusted-business"])
  expect(flags).toHaveBeenCalledWith("location-a")
  expect(flags).toHaveBeenCalledWith("location-b")
})
it("does not bypass a disabled location through the company-wide importer", async () => {
  const disabled = getDefaultFeatureFlags()
  disabled["company.sage_employee_import"] = {
    enabled: false,
    source: "location",
  }
  flags.mockImplementation((id: string) =>
    Promise.resolve(id === "location-b" ? disabled : getDefaultFeatureFlags())
  )
  expect(await canImportSageEmployees(scope)).toBe(false)
  await expect(requireSageEmployeeImportAccess(scope)).rejects.toThrow(
    "Sage employee imports"
  )
})
it("blocks imports when the flag is off everywhere", async () => {
  const disabled = getDefaultFeatureFlags()
  disabled["company.sage_employee_import"] = {
    enabled: false,
    source: "global_off",
  }
  flags.mockResolvedValue(disabled)
  expect(await canImportSageEmployees(scope)).toBe(false)
})
it("checks only the authorized location for a location-scoped importer", async () => {
  expect(
    await canImportSageEmployees({
      ...scope,
      organizationId: null,
      locationId: "trusted-location",
    })
  ).toBe(true)
  expect(query).not.toHaveBeenCalled()
  expect(flags).toHaveBeenCalledExactlyOnceWith("trusted-location")
})
it("does not enable an unconfigured or invalid workspace", async () => {
  query.mockResolvedValue({ rows: [] })
  expect(await canImportSageEmployees(scope)).toBe(false)
  expect(await canImportSageEmployees({ ...scope, organizationId: null })).toBe(
    false
  )
})
