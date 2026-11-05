// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CreateOrganizationPage } from "./create-organization-page"
import type * as React from "react"

const { createOrganization } = vi.hoisted(() => ({
  createOrganization: vi.fn(),
}))
vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const react: typeof React = createRequire(import.meta.url)("react")
  return { ...react, default: react }
})
vi.mock("@tanstack/react-start", () => ({
  useServerFn: () => createOrganization,
}))
vi.mock("@/lib/onboarding", () => ({
  createOrganizationWithBootstrap: vi.fn(),
}))
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}))
vi.mock("@/features/onboarding/components/setup-artwork-shell", () => ({
  SetupArtworkShell: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}))

beforeEach(() => vi.resetAllMocks())
afterEach(cleanup)

function renderForm() {
  const view = render(<CreateOrganizationPage />)
  const name = screen.getByLabelText<HTMLInputElement>("Organisation name")
  fireEvent.change(name, { target: { value: "Onboarding-org1" } })
  const form = view.container.querySelector("form")
  if (!form) throw new Error("Organisation form is missing")
  const button = screen.getByRole<HTMLButtonElement>("button", {
    name: "Continue",
  })
  return { name, form, button }
}

describe("organisation creation recovery", () => {
  it("shows pending feedback and releases the button after repeated setup failures", async () => {
    const { name, form, button } = renderForm()
    let failRequest = () => {}
    createOrganization.mockImplementation(
      () =>
        new Promise((_, reject) => {
          failRequest = () =>
            reject(new Error("We could not load the current onboarding state."))
        })
    )

    for (let attempt = 1; attempt <= 2; attempt++) {
      fireEvent.submit(form)
      await waitFor(() =>
        expect(createOrganization).toHaveBeenCalledTimes(attempt)
      )
      expect(button.disabled).toBe(true)
      expect(button.textContent).toBe("Creating organisation...")
      await act(() => failRequest())
      await waitFor(() => expect(button.disabled).toBe(false))
      expect(button.textContent).toContain("Continue")
      expect(screen.getByRole("alert").textContent).toContain(
        "Refresh the page to try again."
      )
      expect(screen.getByRole("alert").textContent).toContain("contact support")
      expect(
        screen.queryByText("We could not load the current onboarding state.")
      ).toBeNull()
      expect(name.value).toBe("Onboarding-org1")
    }
    expect(createOrganization).toHaveBeenLastCalledWith({
      data: { name: "Onboarding-org1" },
    })
  })

  it("keeps a network failure recoverable without exposing technical details", async () => {
    const { form, button } = renderForm()
    createOrganization.mockRejectedValue(new TypeError("Failed to fetch"))
    fireEvent.submit(form)
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "We couldn’t finish setting up your organisation."
      )
    )
    await waitFor(() => expect(button.disabled).toBe(false))
    expect(screen.queryByText("Failed to fetch")).toBeNull()
  })

  it("preserves an actionable sign-in message for an expired session", async () => {
    const { form, button } = renderForm()
    createOrganization.mockRejectedValue(
      new Error("You need to sign in to continue.")
    )
    fireEvent.submit(form)
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe(
        "You need to sign in to continue."
      )
    )
    await waitFor(() => expect(button.disabled).toBe(false))
  })

  it("allows an invalid name to be corrected before submitting", async () => {
    const { name, form, button } = renderForm()
    fireEvent.change(name, { target: { value: "A" } })
    fireEvent.submit(form)
    await waitFor(() =>
      expect(screen.getByText("Enter an organization name.")).toBeTruthy()
    )
    await waitFor(() => expect(button.disabled).toBe(false))
    expect(createOrganization).not.toHaveBeenCalled()
    fireEvent.change(name, { target: { value: "A valid organisation" } })
    createOrganization.mockRejectedValue(new Error("Temporary server failure"))
    fireEvent.submit(form)
    await waitFor(() => expect(createOrganization).toHaveBeenCalledOnce())
    await waitFor(() => expect(button.disabled).toBe(false))
  })
})
