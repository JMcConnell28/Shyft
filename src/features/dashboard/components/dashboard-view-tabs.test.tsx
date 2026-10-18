// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { DashboardViewTabs } from "./dashboard-view-tabs"
import type * as React from "react"

// Keep Vite SSR and react-dom on the same React instance.
vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const requireReact = createRequire(import.meta.url)
  const react: typeof React = requireReact("react")
  return { ...react, default: react }
})

afterEach(cleanup)

describe("dashboard view tabs", () => {
  it("requests the personal dashboard and updates the selected tab with its content", () => {
    const onViewChange = vi.fn()
    const view = render(
      <DashboardViewTabs canManage view="manager" onViewChange={onViewChange}>
        <h1>Team staffing</h1>
      </DashboardViewTabs>
    )
    expect(
      screen
        .getByRole("tab", { name: "Manager dashboard" })
        .getAttribute("aria-selected")
    ).toBe("true")
    fireEvent.click(screen.getByRole("tab", { name: "My dashboard" }))
    expect(onViewChange).toHaveBeenCalledWith("personal")

    view.rerender(
      <DashboardViewTabs canManage view="personal" onViewChange={onViewChange}>
        <h1>My upcoming shifts</h1>
      </DashboardViewTabs>
    )
    expect(
      screen
        .getByRole("tab", { name: "My dashboard" })
        .getAttribute("aria-selected")
    ).toBe("true")
    expect(
      screen.getByRole("tabpanel", { name: "My dashboard" }).textContent
    ).toContain("My upcoming shifts")
    expect(screen.queryByText("Team staffing")).toBeNull()
    fireEvent.click(screen.getByRole("tab", { name: "Manager dashboard" }))
    expect(onViewChange).toHaveBeenLastCalledWith("manager")
  })

  it("supports keyboard navigation between dashboard tabs", async () => {
    const onViewChange = vi.fn()
    render(
      <DashboardViewTabs canManage view="personal" onViewChange={onViewChange}>
        My upcoming shifts
      </DashboardViewTabs>
    )
    const personalTab = screen.getByRole("tab", { name: "My dashboard" })
    personalTab.focus()
    fireEvent.keyDown(personalTab, { key: "ArrowRight" })
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("tab", { name: "Manager dashboard" })
      )
    })
  })

  it("shows the personal dashboard without a switcher for employees", () => {
    render(
      <DashboardViewTabs
        canManage={false}
        view="personal"
        onViewChange={vi.fn()}
      >
        <h1>My upcoming shifts</h1>
      </DashboardViewTabs>
    )
    expect(
      screen.getByRole("heading", { name: "My upcoming shifts" })
    ).toBeTruthy()
    expect(screen.queryByRole("tablist")).toBeNull()
    expect(screen.queryByText("Manager dashboard")).toBeNull()
  })
})
