// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { RemoveOrganizationSection } from "./remove-organization-section"
import type * as React from "react"
import { SubscriptionCancellationRow } from "@/features/billing/components/subscription-cancellation-row"

const mocks = vi.hoisted(() => ({ cancel: vi.fn(), remove: vi.fn() }))

vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const react: typeof React = createRequire(import.meta.url)("react")
  return { ...react, default: react }
})
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}))
vi.mock("@tanstack/react-start", () => ({
  useServerFn: (fn: unknown) => fn,
}))
vi.mock("@/features/billing/server/workspace-closure-server-fns", () => ({
  cancelOrganizationSubscription: mocks.cancel,
  removeOrganization: mocks.remove,
}))

beforeEach(() => vi.resetAllMocks())
afterEach(cleanup)

function renderSettings(element: React.ReactNode) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      {element}
    </QueryClientProvider>
  )
}

it("confirms cancellation and shows the scheduled end date", async () => {
  mocks.cancel.mockResolvedValue({ endsAt: "2026-12-02T12:00:00.000Z" })
  renderSettings(<SubscriptionCancellationRow organizationId="org-1" />)

  fireEvent.click(screen.getByRole("button", { name: "Cancel subscription" }))
  const dialog = within(await screen.findByRole("alertdialog"))
  expect(mocks.cancel).not.toHaveBeenCalled()
  fireEvent.click(dialog.getByRole("button", { name: "Cancel subscription" }))

  expect(
    await screen.findByText("Subscription ends on 2 Dec 2026.")
  ).toBeTruthy()
  expect(mocks.cancel).toHaveBeenCalledWith({
    data: { organizationId: "org-1" },
  })
})

it("requires the full name and shows an active subscription error without dismissing the dialog", async () => {
  mocks.remove.mockRejectedValue(
    new Error("Wait for the subscription to end before removal.")
  )
  renderSettings(
    <RemoveOrganizationSection
      organizationId="org-1"
      organizationName="Waterfront"
      workspaceSlug="waterfront"
    />
  )
  fireEvent.click(screen.getByRole("button", { name: "Remove organisation" }))
  const dialog = within(await screen.findByRole("alertdialog"))
  const submit = dialog.getByRole<HTMLButtonElement>("button", {
    name: "Remove organisation",
  })
  const name = dialog.getByRole<HTMLInputElement>("textbox", {
    name: "Type the organisation name to confirm",
  })
  expect(submit.disabled).toBe(true)
  fireEvent.change(name, { target: { value: "Waterfront" } })
  fireEvent.click(submit)
  expect((await dialog.findByRole("alert")).textContent).toContain(
    "Wait for the subscription to end"
  )
  expect(mocks.remove).toHaveBeenCalledWith({
    data: { organizationId: "org-1", confirmationName: "Waterfront" },
  })
  expect(name.value).toBe("Waterfront")
})
