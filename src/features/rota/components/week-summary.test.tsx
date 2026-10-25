import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, expect, it, vi } from "vitest"
import WeekSummary from "./week-summary"

const { flags, workspace } = vi.hoisted(() => ({
  flags: vi.fn(),
  workspace: vi.fn(),
}))
vi.mock("@/features/feature-flags/hooks/use-location-feature-flags", () => ({
  useLocationFeatureFlags: flags,
}))
vi.mock("./rota-workspace-provider", () => ({ useRotaWorkspace: workspace }))
vi.mock("./budget-manager-dialog", () => ({
  BudgetManagerDialog: () => <div>Budget dialog</div>,
}))
function data(isDemo = false) {
  return {
    isDemo,
    selectedLocation: { id: "location" },
    meta: { budgetPence: 10000 },
    totalScheduledCost: 200,
    totalScheduledMinutes: 600,
    formatCurrency: (value: number) => `GBP ${value}`,
    formatMinutesAsHours: () => "10h",
    zones: [{ id: "front" }],
    daySummaries: [
      { dayId: "mon", totalCost: 200, totalMinutes: 600, totalShifts: 1 },
    ],
    budgetInsights: {
      suggestions: [{}],
      dayBreakdown: [{ id: "mon", variance: -100 }],
    },
  }
}
beforeEach(() => {
  vi.resetAllMocks()
  workspace.mockReturnValue(data())
  flags.mockReturnValue({ "rota.budget_manager": { enabled: false } })
})
it("hides budget editing, suggestions and variance warnings while keeping labour totals", () => {
  const html = renderToStaticMarkup(<WeekSummary />)
  expect(html).toContain("GBP 200 labour cost")
  expect(html).not.toContain("Edit weekly budget")
  expect(html).not.toContain("Budget dialog")
  expect(html).not.toContain("ideas")
  expect(html).not.toContain("bg-destructive")
})
it("restores saved budget indicators and controls when enabled", () => {
  flags.mockReturnValue({ "rota.budget_manager": { enabled: true } })
  const html = renderToStaticMarkup(<WeekSummary />)
  expect(html).toContain("Edit weekly budget")
  expect(html).toContain("over budget")
  expect(html).toContain("1 ideas")
  expect(html).toContain("Budget dialog")
})
it("keeps demo feature access local", () => {
  workspace.mockReturnValue(data(true))
  renderToStaticMarkup(<WeekSummary />)
  expect(flags).toHaveBeenCalledWith("location", false)
})
