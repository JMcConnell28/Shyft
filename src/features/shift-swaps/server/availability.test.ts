import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  getShiftSwapAvailability,
  isShiftSwappingEnabled,
} from "@/features/shift-swaps/server/availability"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"

const state = vi.hoisted(() => ({
  activeOrganizationId: "org-a",
  query: vi.fn(),
  userId: "user-a",
}))

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/features/rota/server/request-session", () => ({
  requireVerifiedSessionOrThrow: () =>
    Promise.resolve({
      session: {
        user: { id: state.userId },
        session: { activeOrganizationId: state.activeOrganizationId },
      },
    }),
}))
vi.mock("@/lib/auth/has-org-permission", () => ({
  requireOrgPermission: vi.fn(),
}))
vi.mock("@/lib/db", () => ({
  getDatabase: () => ({ query: state.query }),
}))

beforeEach(() => {
  vi.resetAllMocks()
  state.userId = "user-a"
  state.activeOrganizationId = "org-a"
})

describe("shift swap availability", () => {
  it("reads the persisted workspace setting", async () => {
    state.query.mockResolvedValue({ rows: [{ shift_swaps_enabled: false }] })

    expect(await isShiftSwappingEnabled("org-a")).toBe(false)
    expect(state.query).toHaveBeenCalledWith(
      expect.stringContaining("shift_swaps_enabled"),
      ["org-a"]
    )
  })

  it("returns disabled if the workspace cannot be found", async () => {
    state.query.mockResolvedValue({ rows: [] })
    expect(await isShiftSwappingEnabled("missing-org")).toBe(false)
  })

  it("reports a disabled workspace to an authorized visitor", async () => {
    state.query.mockResolvedValue({ rows: [{ shift_swaps_enabled: false }] })

    expect(
      await getShiftSwapAvailability({ organizationId: "org-a", userId: "user-a" })
    ).toBe(false)
  })

  it("checks the session and rota permission before returning availability", async () => {
    state.query.mockResolvedValue({ rows: [{ shift_swaps_enabled: true }] })

    expect(
      await getShiftSwapAvailability({
        organizationId: "org-a",
        userId: "user-a",
      })
    ).toBe(true)
    expect(requireOrgPermission).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-a",
        userId: "user-a",
        permissions: { rota: ["view"] },
      })
    )

    await expect(
      getShiftSwapAvailability({ organizationId: "org-a", userId: "other" })
    ).rejects.toThrow("session is no longer valid")
    expect(state.query).toHaveBeenCalledTimes(1)
  })
})
