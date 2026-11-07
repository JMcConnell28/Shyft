// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./dialog"
import type * as React from "react"

vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const react: typeof React = createRequire(import.meta.url)("react")
  return { ...react, default: react }
})

afterEach(cleanup)

it("keeps click, disabled and link behavior under the workspace style", () => {
  const save = vi.fn()
  const { rerender } = render(
    <>
      <Button variant="primary" onClick={save}>
        Save
      </Button>
      <Button
        variant="secondary"
        nativeButton={false}
        role="link"
        render={<a href="/dashboard" />}
      >
        Back to dashboard
      </Button>
    </>
  )
  fireEvent.click(screen.getByRole("button", { name: "Save" }))
  expect(save).toHaveBeenCalledOnce()
  const link = screen.getByRole("link", { name: "Back to dashboard" })
  expect(link.getAttribute("href")).toBe("/dashboard")
  rerender(
    <>
      <Button disabled onClick={save}>
        Save
      </Button>
    </>
  )
  fireEvent.click(screen.getByRole("button", { name: "Save" }))
  expect(save).toHaveBeenCalledOnce()
})

it("preserves calendar day selection and cell sizing in workspace date pickers", () => {
  const select = vi.fn()
  const { container } = render(
    <>
      <Calendar
        mode="single"
        defaultMonth={new Date(2026, 10, 1)}
        onSelect={select}
      />
    </>
  )
  const days = container.querySelectorAll<HTMLButtonElement>("button[data-day]")
  expect(days.length).toBeGreaterThan(28)
  fireEvent.click(days[10])
  expect(select).toHaveBeenCalledOnce()
})

it("styles composed dialog triggers and their portaled actions", async () => {
  const save = vi.fn()
  render(
    <>
      <Dialog>
        <DialogTrigger render={<Button variant="secondary" />}>
          Edit settings
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Settings</DialogTitle>
          <Button variant="primary" onClick={save}>
            Save settings
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
  const trigger = screen.getByRole("button", { name: "Edit settings" })
  fireEvent.click(trigger)
  const action = await screen.findByRole("button", { name: "Save settings" })
  fireEvent.click(action)
  expect(save).toHaveBeenCalledOnce()
})
