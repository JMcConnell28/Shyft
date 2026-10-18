// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { NewRotaDialog } from "./new-rota-dialog"
import type * as React from "react"
import type { NewRotaDialogContentProps } from "../types/new-rota-dialog"

vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const react: typeof React = createRequire(import.meta.url)("react")
  return { ...react, default: react }
})
const mock = vi.hoisted(() => {
  let resume = () => {}
  const ready = new Promise<void>((resolve) => {
    resume = resolve
  })
  return { loaded: vi.fn(), ready, release: () => resume() }
})
vi.mock("./new-rota-dialog-content", async () => {
  mock.loaded()
  await mock.ready
  const { NewRotaDialogShell } = await import("./new-rota-dialog-shell")
  const { DialogClose } = await import("@/components/ui/dialog")
  return {
    NewRotaDialogContent: (_props: NewRotaDialogContentProps) => (
      <NewRotaDialogShell>
        <label>
          Rota name
          <input />
        </label>
        <DialogClose>Cancel rota</DialogClose>
      </NewRotaDialogShell>
    ),
  }
})

afterEach(cleanup)

describe("rota dialog loading", () => {
  it("does not load its form for a disabled trigger", () => {
    render(
      <NewRotaDialog
        triggerLabel="New rota"
        locations={[]}
        selectedLocation={null}
        disabled
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "New rota" }))
    expect(mock.loaded).not.toHaveBeenCalled()
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("loads on first click, shows loading feedback, and supports closing and reopening", async () => {
    render(
      <NewRotaDialog
        triggerLabel="Create rota"
        locations={[]}
        selectedLocation={null}
      />
    )
    const trigger = screen.getByRole("button", { name: "Create rota" })
    expect(mock.loaded).not.toHaveBeenCalled()
    trigger.focus()
    fireEvent.click(trigger)
    expect(await screen.findByRole("status")).toHaveProperty(
      "textContent",
      "Loading rota options…"
    )
    expect(mock.loaded).toHaveBeenCalledTimes(1)
    mock.release()
    expect(await screen.findByLabelText("Rota name")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Cancel rota" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
    fireEvent.click(trigger)
    expect(await screen.findByLabelText("Rota name")).toBeTruthy()
    expect(mock.loaded).toHaveBeenCalledTimes(1)
  })
})
