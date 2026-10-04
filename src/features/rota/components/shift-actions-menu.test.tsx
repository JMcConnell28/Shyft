// @vitest-environment jsdom
import { useEffect } from "react"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type * as React from "react"
import { ShiftActionsMenu } from "@/features/rota/components/shift-actions-menu"
import {
  RotaWorkspaceProvider,
  useRotaWorkspace,
} from "@/features/rota/components/rota-workspace-provider"
import { assignmentBoard } from "@/features/rota/test/shift-assignment-fixture"

vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const requireReact = createRequire(import.meta.url)
  const react: typeof React = requireReact("react")
  return { ...react, default: react }
})
vi.mock("@/features/rota/hooks/use-touch-input", () => ({
  useTouchInput: () => false,
}))
vi.mock("@/lib/toast", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}))

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
  HTMLElement.prototype.scrollIntoView = vi.fn()
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

function BoardProbe() {
  const { assignmentsById, hasUnsavedChanges, setSearchQuery } =
    useRotaWorkspace()
  useEffect(() => {
    setSearchQuery("no sidebar matches")
  }, [setSearchQuery])
  return (
    <output data-testid="assignments">
      {JSON.stringify({ assignmentsById, hasUnsavedChanges })}
    </output>
  )
}

function renderMenu(canEdit = true) {
  return render(
    <RotaWorkspaceProvider
      boardData={{
        ...assignmentBoard,
        meta: { ...assignmentBoard.meta, canEdit },
      }}
      mode="demo"
    >
      <ShiftActionsMenu
        shiftId="target"
        shiftLabel="Mon 8 Jun, 09:00 - 15:00, Floor"
        assignmentCount={1}
      />
      <BoardProbe />
    </RotaWorkspaceProvider>
  )
}

async function openWithKeyboard() {
  const trigger = screen.getByRole("button", { name: /Shift options:/ })
  trigger.focus()
  fireEvent.keyDown(trigger, { key: "ArrowDown" })
  const assign = await screen.findByRole("menuitem", {
    name: "Assign employee",
  })
  await waitFor(() => expect(document.activeElement).toBe(assign))
  fireEvent.keyDown(assign, { key: "Enter" })
  const search = await screen.findByRole(
    "combobox",
    { name: "Search employees" },
    { timeout: 15000 }
  )
  await waitFor(() => expect(document.activeElement).toBe(search))
  return { trigger, search }
}

describe("shift assignment menu", () => {
  it("opens by keyboard, keeps conflicting employees visible and shows group colours despite sidebar filters", async () => {
    renderMenu()
    await openWithKeyboard()
    const ava = screen.getByRole("option", { name: /Ava/ })
    const ella = screen.getByRole("option", { name: /Ella/ })
    expect(ava.getAttribute("aria-disabled")).toBe("true")
    expect(ava.textContent).toContain("Already assigned")
    expect(ella.getAttribute("aria-disabled")).toBe("true")
    expect(ella.textContent).toContain("Overlapping shift")
    expect(screen.getAllByRole("option")).toHaveLength(4)
    const leo = screen.getByRole("option", { name: /Leo/ })
    expect(leo.textContent).toContain("Front of house")
    expect(leo.querySelector("[aria-hidden=true]")?.className).toContain(
      "bg-sky-500"
    )
  })

  it("skips disabled employees and assigns with Enter, marking the rota unsaved and restoring focus", async () => {
    renderMenu()
    const { trigger, search } = await openWithKeyboard()
    await waitFor(() =>
      expect(
        screen
          .getByRole("option", { name: /Leo/ })
          .getAttribute("aria-selected")
      ).toBe("true")
    )
    fireEvent.keyDown(search, { key: "ArrowDown" })
    expect(
      screen.getByRole("option", { name: /Remy/ }).getAttribute("aria-selected")
    ).toBe("true")
    fireEvent.keyDown(search, { key: "ArrowUp" })
    fireEvent.keyDown(search, { key: "Enter" })
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(screen.getByTestId("assignments").textContent).toContain(
      '"employeeId":"leo","shiftId":"target"'
    )
    expect(screen.getByTestId("assignments").textContent).toContain(
      '"hasUnsavedChanges":true'
    )
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it("searches names and groups and allows Escape to cancel", async () => {
    renderMenu()
    const { trigger, search } = await openWithKeyboard()
    fireEvent.change(search, { target: { value: "Remy" } })
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1))
    fireEvent.change(search, { target: { value: "Front of house" } })
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(4))
    fireEvent.keyDown(search, { key: "Escape" })
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(screen.getByTestId("assignments").textContent).toContain(
      '"hasUnsavedChanges":false'
    )
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it("hides assignment actions for a read-only rota", () => {
    renderMenu(false)
    expect(screen.queryByRole("button", { name: /Shift options:/ })).toBeNull()
  })
})
