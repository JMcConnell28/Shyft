// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import type * as React from "react"
import { Route as AcceptInvitation } from "@/routes/accept-invitation/$invitationId"
import { Route as VerifyEmail } from "@/routes/verify-email"

const mocks = vi.hoisted(() => ({
  verify: vi.fn(),
  invite: vi.fn(),
  resend: vi.fn(),
  accept: vi.fn(),
}))

vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const react: typeof React = createRequire(import.meta.url)("react")
  return { ...react, default: react }
})
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: (path: string) => (options: object) => ({
    options,
    useLoaderData: path === "/verify-email" ? mocks.verify : mocks.invite,
  }),
  Link: ({
    to,
    search,
    ...props
  }: React.ComponentPropsWithRef<"a"> & {
    to: string
    search?: { redirect: string }
  }) => (
    <a
      {...props}
      href={
        search ? `${to}?redirect=${encodeURIComponent(search.redirect)}` : to
      }
    />
  ),
  redirect: vi.fn(),
}))
vi.mock("@tanstack/react-start", () => ({
  useServerFn: (fn: unknown) => fn,
}))
vi.mock("@/lib/auth-server", () => ({ getSession: vi.fn() }))
vi.mock("@/lib/email-verification", () => ({
  isEmailVerificationSatisfied: (verified: boolean) => verified,
}))
vi.mock("@/lib/onboarding", () => ({
  acceptOrganizationInvitation: mocks.accept,
  resendVerificationEmail: mocks.resend,
}))
vi.mock("@/lib/toast", () => ({ showSuccessToast: vi.fn() }))
vi.mock("@/components/app/sign-out-button", () => ({
  SignOutButton: () => <button type="button">Log out</button>,
}))

beforeEach(() => vi.resetAllMocks())
afterEach(cleanup)

function renderPage(route: typeof VerifyEmail | typeof AcceptInvitation) {
  const Component = route.options.component
  if (!Component) throw new Error("Missing auth page")
  render(<Component />)
}

it("shows the verification destination and keeps the address editable after a failed resend", async () => {
  mocks.verify.mockReturnValue({
    email: "first@example.com",
    redirect: "/onboarding/location",
    sent: true,
    hasSession: true,
  })
  let rejectResend = () => {}
  mocks.resend.mockImplementationOnce(
    () =>
      new Promise((_, reject) => {
        rejectResend = () => reject(new Error("Please try again later."))
      })
  )
  mocks.resend.mockResolvedValueOnce(undefined)
  renderPage(VerifyEmail)

  expect(screen.getByRole("heading", { name: "Check your inbox" })).toBeTruthy()
  expect(screen.getByRole("button", { name: "Log out" })).toBeTruthy()
  const email = screen.getByRole<HTMLInputElement>("textbox", {
    name: "Email address",
  })
  fireEvent.change(email, { target: { value: "second@example.com" } })
  fireEvent.click(
    screen.getByRole("button", { name: "Resend verification email" })
  )
  const pending = await screen.findByRole<HTMLButtonElement>("button", {
    name: "Sending email...",
  })
  expect(pending.disabled).toBe(true)
  await act(() => rejectResend())
  expect((await screen.findByRole("alert")).textContent).toContain(
    "Please try again later."
  )
  expect(email.value).toBe("second@example.com")
  fireEvent.click(
    screen.getByRole("button", { name: "Resend verification email" })
  )
  expect(await screen.findByText("second@example.com")).toBeTruthy()
  expect(mocks.resend).toHaveBeenLastCalledWith({
    data: { email: "second@example.com", callbackURL: "/onboarding/location" },
  })
  expect(
    screen
      .getByRole("link", { name: "I’ve verified my email" })
      .getAttribute("href")
  ).toBe("/onboarding/location")
})

it("returns signed-out invitees to the invitation after sign-in or account creation", () => {
  mocks.invite.mockReturnValue({
    invitationId: "test-invite",
    signedInEmail: null,
  })
  renderPage(AcceptInvitation)
  expect(
    screen.getByRole("link", { name: "Sign in" }).getAttribute("href")
  ).toBe("/login?redirect=%2Faccept-invitation%2Ftest-invite")
  expect(
    screen.getByRole("link", { name: "Create account" }).getAttribute("href")
  ).toBe("/sign-up?redirect=%2Faccept-invitation%2Ftest-invite")
})

it("shows the signed-in address and allows retries if accepting the invitation fails", async () => {
  mocks.invite.mockReturnValue({
    invitationId: "test-invite",
    signedInEmail: "manager@example.com",
  })
  mocks.accept.mockRejectedValue(new Error("This invitation has expired."))
  renderPage(AcceptInvitation)
  expect(screen.getByText("manager@example.com")).toBeTruthy()
  const button = screen.getByRole<HTMLButtonElement>("button", {
    name: "Accept invitation",
  })
  fireEvent.click(button)
  expect((await screen.findByRole("alert")).textContent).toContain(
    "This invitation has expired."
  )
  await waitFor(() => expect(button.disabled).toBe(false))
  expect(mocks.accept).toHaveBeenCalledWith({
    data: { invitationId: "test-invite" },
  })
})
