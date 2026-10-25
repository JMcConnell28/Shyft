import { beforeEach, expect, it, vi } from "vitest"
import { updateRotaBudget } from "./update-actions"

const { gate, query } = vi.hoisted(() => ({ gate: vi.fn(), query: vi.fn() }))
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
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))
vi.mock("@/features/feature-flags/server/evaluation", () => ({
  requireLocationFeature: gate,
}))
vi.mock("./write-access", () => ({
  requireRotaWriteAccess: () =>
    Promise.resolve({
      location: { id: "trusted-location" },
      organizationId: "org",
    }),
}))
vi.mock("./publish-notifications", () => ({
  sendRotaPublishedNotifications: vi.fn(),
}))
vi.mock("./lookups", () => ({ getOrganizationSlugById: vi.fn() }))
vi.mock("./rota-settings", () => ({ getLocationRotaSettings: vi.fn() }))
vi.mock("@/features/shift-swaps/server/publish-overrides", () => ({
  reapplyApprovedShiftSwapOverrides: vi.fn(),
}))
beforeEach(() => {
  vi.resetAllMocks()
  gate.mockRejectedValue(new Error("Budget manager unavailable"))
  query.mockResolvedValue({ rows: [] })
})
it.each([10000, null])(
  "blocks direct budget updates and removal when disabled (%s)",
  async (budgetPence) => {
    await expect(
      updateRotaBudget({
        data: { rotaId: "00000000-0000-4000-8000-000000000001", budgetPence },
      })
    ).rejects.toThrow("Budget manager unavailable")
    expect(gate).toHaveBeenCalledWith("rota.budget_manager", "trusted-location")
    expect(query).not.toHaveBeenCalled()
  }
)
it("allows existing authorized budget updates when enabled", async () => {
  gate.mockResolvedValue(undefined)
  await updateRotaBudget({
    data: {
      rotaId: "00000000-0000-4000-8000-000000000001",
      budgetPence: 10000,
    },
  })
  expect(query).toHaveBeenCalledWith(
    expect.stringContaining("insert into public.rota_budgets"),
    expect.any(Array)
  )
})
