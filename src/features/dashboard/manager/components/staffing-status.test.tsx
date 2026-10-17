// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { DashboardStaffingStatus } from "./staffing-status"
import type * as React from "react"

// Keep Vite SSR and react-dom on the same React instance.
vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const requireReact = createRequire(import.meta.url)
  const react: typeof React = requireReact("react")
  return { ...react, default: react }
})

afterEach(cleanup)

describe("dashboard staffing feedback", () => {
  it("replaces loading with an error without claiming a successful update", () => {
    const props = {
      updatedAt: "2026-10-17T10:30:00.000Z",
      timeZone: "Europe/London",
      timeFormat: "24h" as const,
    }
    const view = render(<DashboardStaffingStatus {...props} status="pending" />)
    expect(screen.getByText(/Loading staffing/)).toBeTruthy()
    expect(view.container.querySelector("time")).toBeNull()

    view.rerender(<DashboardStaffingStatus {...props} status="error" />)
    expect(screen.getByText(/Could not load staffing/)).toBeTruthy()
    expect(screen.queryByText(/Loading staffing/)).toBeNull()
    expect(view.container.querySelector("time")).toBeNull()

    view.rerender(<DashboardStaffingStatus {...props} status="pending" />)
    expect(screen.getByText(/Loading staffing/)).toBeTruthy()
    expect(screen.queryByText(/Could not load staffing/)).toBeNull()

    view.rerender(<DashboardStaffingStatus {...props} status="success" />)
    expect(screen.queryByText(/Loading staffing|Could not load staffing/)).toBeNull()
    expect(view.container.querySelector("time")?.dateTime).toBe(props.updatedAt)
    expect(view.container.querySelector("time")?.textContent).toBe("11:30")
  })
})
