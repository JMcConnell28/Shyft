// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { useForm } from "@tanstack/react-form"
import { afterEach, describe, expect, it, vi } from "vitest"
import type * as React from "react"
import type { RotaTimeFormat } from "@/features/rota/schemas/time-format-schema"
import { CreateShiftTimeField } from "@/features/rota/components/create-shift-time-field"

vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const requireReact = createRequire(import.meta.url)
  const react: typeof React = requireReact("react")
  return { ...react, default: react }
})
afterEach(cleanup)

function TimeField({
  timeFormat,
  disabled = false,
}: {
  timeFormat: RotaTimeFormat
  disabled?: boolean
}) {
  const form = useForm({ defaultValues: { time: "17:30" } })
  return (
    <>
      <form.Field name="time">
        {(field) => (
          <CreateShiftTimeField
            field={field}
            label="Start time"
            timeFormat={timeFormat}
            disabled={disabled}
          />
        )}
      </form.Field>
      <form.Subscribe selector={(state) => state.values.time}>
        {(time) => <output data-testid="stored-time">{time}</output>}
      </form.Subscribe>
    </>
  )
}

function getNativeSelect(label: string): HTMLSelectElement {
  const select = screen
    .getAllByLabelText(label)
    .find((element) => element instanceof HTMLSelectElement)
  if (!select) throw new Error(`Missing time select: ${label}`)
  return select
}

describe("create shift time input", () => {
  it("uses AM/PM controls and converts edits to the correct stored time", () => {
    render(<TimeField timeFormat="12h" />)
    expect(getNativeSelect("Start time hour").value).toBe("05")
    expect(getNativeSelect("Start time period").value).toBe("PM")
    fireEvent.change(getNativeSelect("Start time period"), {
      target: { value: "AM" },
    })
    expect(screen.getByTestId("stored-time").textContent).toBe("05:30")
    fireEvent.change(getNativeSelect("Start time hour"), {
      target: { value: "12" },
    })
    expect(screen.getByTestId("stored-time").textContent).toBe("00:30")
  })

  it("uses hours 00–23 without an AM/PM control in 24-hour mode", () => {
    render(<TimeField timeFormat="24h" />)
    const hour = getNativeSelect("Start time hour")
    expect(hour.value).toBe("17")
    expect(hour.options).toHaveLength(24)
    expect(hour.options[0].value).toBe("00")
    expect(hour.options[23].value).toBe("23")
    expect(screen.queryByLabelText("Start time period")).toBeNull()
    fireEvent.change(hour, { target: { value: "23" } })
    fireEvent.change(getNativeSelect("Start time minutes"), {
      target: { value: "45" },
    })
    expect(screen.getByTestId("stored-time").textContent).toBe("23:45")
  })

  it("preserves the entered time when switching formats", () => {
    const { rerender } = render(<TimeField timeFormat="12h" />)
    fireEvent.change(getNativeSelect("Start time hour"), {
      target: { value: "11" },
    })
    rerender(<TimeField timeFormat="24h" />)
    expect(getNativeSelect("Start time hour").value).toBe("23")
    expect(screen.getByTestId("stored-time").textContent).toBe("23:30")
    rerender(<TimeField timeFormat="12h" />)
    expect(getNativeSelect("Start time hour").value).toBe("11")
    expect(getNativeSelect("Start time period").value).toBe("PM")
  })

  it.each<RotaTimeFormat>(["12h", "24h"])(
    "keeps closing-time inputs disabled in %s",
    (timeFormat) => {
      render(<TimeField timeFormat={timeFormat} disabled />)
      expect(getNativeSelect("Start time hour").disabled).toBe(true)
      expect(getNativeSelect("Start time minutes").disabled).toBe(true)
    }
  )
})
