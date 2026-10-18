// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ClockDurationInput } from "./clock-duration-input"
import type * as React from "react"

vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const requireReact = createRequire(import.meta.url)
  const react: typeof React = requireReact("react")
  return { ...react, default: react }
})
afterEach(cleanup)

describe("custom clock durations", () => {
  it("allows a multi-digit custom value and commits only after leaving the field", () => {
    const onChange = vi.fn()
    render(
      <ClockDurationInput
        label="Scheduled delay"
        value={120}
        min={16}
        max={2880}
        onChange={onChange}
      />
    )
    const input = screen.getByRole("spinbutton", { name: "Scheduled delay" })
    fireEvent.change(input, { target: { value: "2" } })
    fireEvent.change(input, { target: { value: "235" } })
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledWith(235)
  })
  it("shows an error and preserves the saved policy when a duration is invalid", () => {
    const onChange = vi.fn()
    render(
      <ClockDurationInput
        label="Reminder"
        value={15}
        min={1}
        max={119}
        onChange={onChange}
      />
    )
    const input = screen.getByRole("spinbutton", { name: "Reminder" })
    fireEvent.change(input, { target: { value: "120" } })
    fireEvent.blur(input)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole("alert").textContent).toContain("1–119")
    expect(input.getAttribute("aria-invalid")).toBe("true")
  })
})
