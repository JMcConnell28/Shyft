// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { LocationSetupWizard } from "./location-setup-wizard"
import type * as React from "react"

vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const react: typeof React = createRequire(import.meta.url)("react")
  return { ...react, default: react }
})

afterEach(cleanup)

it("edits the saved organisation from location setup and review without losing the draft", async () => {
  const rename = vi
    .fn<(name: string) => Promise<{ name: string }>>()
    .mockRejectedValueOnce(new TypeError("Failed to fetch"))
    .mockImplementation((name) => Promise.resolve({ name }))
  const createWorkspace = vi.fn()

  render(
    <LocationSetupWizard
      organizationName="Original restaurant"
      onRenameOrganization={rename}
      onSubmit={createWorkspace}
    />
  )

  const location = screen.getByLabelText<HTMLInputElement>(
    "First location name"
  )
  fireEvent.change(location, { target: { value: "Waterfront Bar" } })
  fireEvent.click(
    screen.getByRole("button", { name: "Edit organisation name" })
  )

  const dialog = within(await screen.findByRole("dialog"))
  const name = dialog.getByLabelText<HTMLInputElement>("Organisation name")
  expect(name.value).toBe("Original restaurant")
  fireEvent.change(name, { target: { value: "  Updated restaurant  " } })
  fireEvent.click(dialog.getByRole("button", { name: "Save name" }))
  expect((await dialog.findByRole("alert")).textContent).toContain(
    "We could not save your organisation name."
  )
  expect(name.value).toBe("  Updated restaurant  ")
  fireEvent.click(dialog.getByRole("button", { name: "Save name" }))
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  expect(rename).toHaveBeenLastCalledWith("Updated restaurant")
  expect(screen.getByText("Updated restaurant")).toBeTruthy()
  expect(location.value).toBe("Waterfront Bar")

  for (let step = 0; step < 3; step++) {
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))
  }
  expect(
    screen.getByRole("heading", { name: "Review and create" })
  ).toBeTruthy()
  fireEvent.click(
    screen.getByRole("button", { name: "Edit organisation name" })
  )
  const reviewDialog = within(await screen.findByRole("dialog"))
  const reviewName =
    reviewDialog.getByLabelText<HTMLInputElement>("Organisation name")
  expect(reviewName.value).toBe("Updated restaurant")
  fireEvent.change(reviewName, { target: { value: "Final restaurant" } })
  fireEvent.click(reviewDialog.getByRole("button", { name: "Save name" }))
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  expect(
    screen.getByRole("heading", { name: "Review and create" })
  ).toBeTruthy()
  expect(screen.getByText("Final restaurant")).toBeTruthy()
  expect(screen.getByText("Waterfront Bar")).toBeTruthy()
  expect(createWorkspace).not.toHaveBeenCalled()
})
