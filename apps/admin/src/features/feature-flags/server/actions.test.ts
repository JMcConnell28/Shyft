import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  updateFeatureFlagSchema,
  updateLocationFlagSchema,
} from "../schemas/feature-flag-schemas"
import { changeFeatureFlag } from "./actions"

const { query, audit, release } = vi.hoisted(() => ({
  query: vi.fn(),
  audit: vi.fn(),
  release: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@rocketrota/db", () => ({
  getDatabase: () => ({ connect: () => Promise.resolve({ query, release }) }),
}))
vi.mock("@/features/audit/server/audit-log", () => ({
  writeAdminAuditLog: audit,
}))
beforeEach(() => {
  vi.clearAllMocks()
  query.mockReset()
  query.mockResolvedValue({ rows: [] })
  audit.mockResolvedValue(undefined)
  query
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({
      rows: [
        { id: "flag", revision: 3, is_enabled: true, default_value: true },
      ],
    })
})
describe("feature flag administration", () => {
  it("switches off globally and commits the audit record atomically", async () => {
    await changeFeatureFlag(
      {
        key: "rota.templates",
        mode: "off",
        expectedRevision: 3,
        reason: "Investigating a bug",
      },
      "admin"
    )
    expect(query.mock.calls[3]?.[1]).toEqual(["flag", false, "false", "admin"])
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        beforeState: { isEnabled: true, defaultValue: true },
        afterState: { mode: "off" },
      }),
      expect.objectContaining({ query })
    )
    expect(query).toHaveBeenLastCalledWith("commit")
  })
  it("rejects stale decisions before applying a mutation", async () => {
    await expect(
      changeFeatureFlag(
        { key: "rota.templates", mode: "all", expectedRevision: 2, reason: "" },
        "admin"
      )
    ).rejects.toThrow("Another admin")
    expect(audit).not.toHaveBeenCalled()
    expect(query).toHaveBeenLastCalledWith("rollback")
  })
  it("rolls back configuration when its audit write fails", async () => {
    audit.mockRejectedValue(new Error("Audit unavailable"))
    await expect(
      changeFeatureFlag(
        {
          key: "rota.templates",
          mode: "selected",
          expectedRevision: 3,
          reason: "",
        },
        "admin"
      )
    ).rejects.toThrow("Audit unavailable")
    expect(query).toHaveBeenLastCalledWith("rollback")
  })
  it("removes only the chosen override when inheriting again", async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: "location" }] })
      .mockResolvedValueOnce({ rows: [{ value: false }] })
    await changeFeatureFlag(
      {
        key: "rota.templates",
        locationId: "00000000-0000-4000-8000-000000000001",
        override: "inherit",
        expectedRevision: 3,
        reason: "",
      },
      "admin"
    )
    expect(query.mock.calls[5]?.[0]).toContain(
      "delete from admin_private.feature_flag_targets"
    )
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        beforeState: { override: false },
        afterState: { override: "inherit" },
      }),
      expect.objectContaining({ query })
    )
  })
  it("accepts only implemented keys and explicit boolean override choices", () => {
    expect(
      updateFeatureFlagSchema.safeParse({
        key: "made.up",
        mode: "all",
        expectedRevision: 0,
      }).success
    ).toBe(false)
    expect(
      updateLocationFlagSchema.safeParse({
        key: "rota.templates",
        locationId: "00000000-0000-4000-8000-000000000001",
        override: "false",
        expectedRevision: 0,
      }).success
    ).toBe(false)
  })
})
