// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { createPortal } from "react-dom"
import { afterEach, expect, it, vi } from "vitest"
import { Button } from "./button"
import { ButtonStyleProvider } from "./button-style-provider"
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
    <ButtonStyleProvider appearance="workspace">
      <Button onClick={save}>Save</Button>
      <Button
        variant="outline"
        nativeButton={false}
        role="link"
        render={<a href="/dashboard" />}
      >
        Back to dashboard
      </Button>
    </ButtonStyleProvider>
  )
  fireEvent.click(screen.getByRole("button", { name: "Save" }))
  expect(save).toHaveBeenCalledOnce()
  const link = screen.getByRole("link", { name: "Back to dashboard" })
  expect(link.getAttribute("href")).toBe("/dashboard")
  expect(link.getAttribute("data-button-tone")).toBe("secondary")
  rerender(
    <ButtonStyleProvider appearance="workspace">
      <Button disabled onClick={save}>
        Save
      </Button>
    </ButtonStyleProvider>
  )
  fireEvent.click(screen.getByRole("button", { name: "Save" }))
  expect(save).toHaveBeenCalledOnce()
})

it("carries the style through portals while keeping nested rota controls unchanged", () => {
  render(
    <ButtonStyleProvider appearance="workspace">
      {createPortal(<Button>Save dialog</Button>, document.body)}
      <ButtonStyleProvider appearance="default">
        <Button variant="raised" className="bg-blue-600">
          Publish rota
        </Button>
      </ButtonStyleProvider>
      <Button variant="destructive">Delete zone</Button>
    </ButtonStyleProvider>
  )
  expect(
    screen
      .getByRole("button", { name: "Save dialog" })
      .getAttribute("data-appearance")
  ).toBe("workspace")
  expect(
    screen
      .getByRole("button", { name: "Publish rota" })
      .getAttribute("data-appearance")
  ).toBe("default")
  expect(
    screen
      .getByRole("button", { name: "Delete zone" })
      .getAttribute("data-button-tone")
  ).toBe("destructive")
})

it("preserves calendar day selection and cell sizing in workspace date pickers", () => {
  const select = vi.fn()
  const { container } = render(
    <ButtonStyleProvider appearance="workspace">
      <Calendar
        mode="single"
        defaultMonth={new Date(2026, 10, 1)}
        onSelect={select}
      />
    </ButtonStyleProvider>
  )
  const days = container.querySelectorAll<HTMLButtonElement>("button[data-day]")
  expect(days.length).toBeGreaterThan(28)
  expect(
    [...days].every((day) => day.getAttribute("data-appearance") === "default")
  ).toBe(true)
  fireEvent.click(days[10])
  expect(select).toHaveBeenCalledOnce()
})

it("styles composed dialog triggers and their portaled actions", async () => {
  const save = vi.fn()
  render(
    <ButtonStyleProvider appearance="workspace">
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>
          Edit settings
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Settings</DialogTitle>
          <Button onClick={save}>Save settings</Button>
        </DialogContent>
      </Dialog>
    </ButtonStyleProvider>
  )
  const trigger = screen.getByRole("button", { name: "Edit settings" })
  expect(trigger.getAttribute("data-appearance")).toBe("workspace")
  fireEvent.click(trigger)
  const action = await screen.findByRole("button", { name: "Save settings" })
  expect(action.getAttribute("data-appearance")).toBe("workspace")
  fireEvent.click(action)
  expect(save).toHaveBeenCalledOnce()
})
