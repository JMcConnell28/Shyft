import { beforeEach, expect, it, vi } from "vitest"

const { permission, change } = vi.hoisted(() => ({
  permission: vi.fn(),
  change: vi.fn(),
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
        return (options: { data?: unknown } = {}) =>
          fn({ data: validate(options.data) })
      },
    }
  },
}))
vi.mock("@/features/auth/server/admin-session", () => ({
  requireAdminPermission: permission,
}))
vi.mock("./server/actions", () => ({ changeFeatureFlag: change }))
beforeEach(() => {
  vi.clearAllMocks()
  permission.mockRejectedValue(new Error("Permission denied"))
})
it("rejects global and location changes without feature_flags.manage", async () => {
  const { updateFeatureFlagServerFn, updateLocationFlagServerFn } =
    await import("./server-fns")
  await expect(
    updateFeatureFlagServerFn({
      data: {
        key: "rota.templates",
        mode: "off",
        expectedRevision: 0,
        reason: "",
      },
    })
  ).rejects.toThrow("Permission denied")
  await expect(
    updateLocationFlagServerFn({
      data: {
        key: "rota.templates",
        locationId: "00000000-0000-4000-8000-000000000001",
        override: "enabled",
        expectedRevision: 0,
        reason: "",
      },
    })
  ).rejects.toThrow("Permission denied")
  expect(permission).toHaveBeenCalledWith("feature_flags.manage")
  expect(change).not.toHaveBeenCalled()
})
