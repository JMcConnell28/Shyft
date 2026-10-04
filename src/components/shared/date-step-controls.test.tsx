// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type * as React from "react"

import { TimeClockHeader } from "@/features/time-clock/components/time-clock-header"
import { TimesheetHeader } from "@/features/timesheets/components/timesheet-header"
import { RotaListFilters } from "@/features/rota/components/rota-list-filters"
import { MobileRotaFilters } from "@/features/rota/components/mobile-rota-filters"
import { parseRotaListSearch } from "@/features/rota/schemas/rota-schemas"
import { buildTimesheetPage } from "@/features/timesheets/server/build-timesheet"
import { getTimesheetWeek } from "@/features/timesheets/utils/timesheet-time"
import { DATE_SELECTION_DEBOUNCE_MS } from "@/hooks/date-selection.constants"

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }))
vi.mock("@tanstack/react-router", () => ({ useNavigate: () => navigate }))
vi.mock("@/lib/toast", () => ({ showErrorToast: vi.fn() }))
vi.mock(
  "@/features/timesheets/components/sage-timesheet-export-button",
  () => ({
    SageTimesheetExportButton: ({
      disabledReason,
    }: {
      disabledReason: string | null
    }) => <button disabled={Boolean(disabledReason)}>Export</button>,
  })
)
vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const requireReact = createRequire(import.meta.url)
  const react: typeof React = requireReact("react")
  return { ...react, default: react }
})

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.clearAllMocks()
})

async function settleSelection() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(DATE_SELECTION_DEBOUNCE_MS)
  })
}

describe("date navigation controls", () => {
  it("loads only the last mobile rota week range", async () => {
    const onRangeChange = vi.fn()
    render(
      <MobileRotaFilters
        canEditRotas={false}
        data={{
          locations: [],
          selectedLocation: null,
          filters: parseRotaListSearch({}),
        }}
        onRangeChange={onRangeChange}
        onLocationChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onStatusChange={vi.fn()}
      />
    )
    const sort = screen.getByRole("combobox", { name: "Sort" })
    fireEvent.change(sort, { target: { value: "range:next-4-weeks" } })
    fireEvent.change(sort, { target: { value: "range:past-4-weeks" } })
    expect(onRangeChange).not.toHaveBeenCalled()
    await settleSelection()
    expect(onRangeChange).toHaveBeenCalledExactlyOnceWith("past-4-weeks")
  })

  it("advances time tracking without waiting for a slow navigation", async () => {
    navigate.mockImplementation(() => new Promise<void>(() => {}))
    render(
      <TimeClockHeader
        selectedDate="2026-06-01"
        workspaceSlug="shack"
        isRefreshing={false}
        onRefresh={vi.fn()}
      />
    )
    const next = screen.getByRole("button", { name: "Next day" })
    fireEvent.click(next)
    fireEvent.click(next)
    fireEvent.click(next)
    const selectedDateLabel = screen.getByText("Thu, 4 Jun")
    expect(selectedDateLabel).toBeDefined()
    expect(
      selectedDateLabel
        .closest('[aria-busy="true"]')
        ?.querySelector("svg")
        ?.classList.contains("animate-spin")
    ).toBe(true)
    expect(navigate).not.toHaveBeenCalled()
    await settleSelection()
    expect(navigate).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ search: { date: "2026-06-04" } })
    )
    fireEvent.click(next)
    expect(screen.getByText("Fri, 5 Jun")).toBeDefined()
    expect(next.hasAttribute("disabled")).toBe(false)
    await settleSelection()
    expect(navigate).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: { date: "2026-06-05" } })
    )
  })

  it("advances timesheet weeks immediately and blocks exports of the previous week", async () => {
    const week = getTimesheetWeek("2026-06-01")
    const data = {
      ...week,
      ...buildTimesheetPage({
        employeeIds: [],
        employeeName: "Sam",
        employees: [],
        entries: [],
        scheduledShifts: [],
        now: new Date("2026-06-08"),
        week,
      }),
      canManage: true,
      locations: [],
      writableLocationIds: [],
    }
    render(
      <TimesheetHeader
        data={data}
        activeView="team"
        canViewTeam
        input={{ organizationId: "org", userId: "user" }}
        onViewChange={vi.fn()}
        workspaceSlug="shack"
      />
    )
    expect(
      screen.getByRole("button", { name: "Export" }).hasAttribute("disabled")
    ).toBe(false)
    const previous = screen.getByRole("button", { name: "Previous week" })
    fireEvent.click(previous)
    fireEvent.click(previous)
    expect(
      screen.getByText(getTimesheetWeek("2026-05-18").weekLabel)
    ).toBeDefined()
    expect(
      screen.getByRole("button", { name: "Export" }).hasAttribute("disabled")
    ).toBe(true)
    expect(navigate).not.toHaveBeenCalled()
    await settleSelection()
    expect(navigate).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ search: { weekStart: "2026-05-18" } })
    )
  })

  it("combines both rota date fields into one request and supports clearing dates", async () => {
    const onChange = vi.fn()
    const onRangeChange = vi.fn()
    render(
      <RotaListFilters
        from="2026-06-01"
        to="2026-06-14"
        range="custom"
        status="all"
        locations={[]}
        selectedLocationId="location"
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
        onCustomRangeChange={onChange}
        onRangeChange={onRangeChange}
        onStatusChange={vi.fn()}
        onLocationChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    )
    const from = screen.getByLabelText<HTMLInputElement>("Rota start date")
    const to = screen.getByLabelText<HTMLInputElement>("Rota end date")
    fireEvent.change(from, { target: { value: "2026-06-08" } })
    fireEvent.change(to, { target: { value: "2026-06-21" } })
    expect(from.value).toBe("2026-06-08")
    expect(to.value).toBe("2026-06-21")
    expect(onChange).not.toHaveBeenCalled()
    await settleSelection()
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      from: "2026-06-08",
      to: "2026-06-21",
    })
    fireEvent.change(to, { target: { value: "" } })
    await settleSelection()
    expect(onChange).toHaveBeenLastCalledWith({
      from: "2026-06-08",
      to: undefined,
    })
    fireEvent.change(from, { target: { value: "2026-06-15" } })
    fireEvent.change(
      screen.getByRole("combobox", { name: "Rota date range" }),
      { target: { value: "all" } }
    )
    await settleSelection()
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onRangeChange).toHaveBeenCalledExactlyOnceWith("all")
  })
})
