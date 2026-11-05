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
import type * as React from "react"
import { Route as LoginRoute } from "@/routes/login"
import { Route as SignUpRoute } from "@/routes/sign-up"

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  passkey: vi.fn(),
  saveIntent: vi.fn(),
  navigate: vi.fn(),
}))

vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const react: typeof React = createRequire(import.meta.url)("react")
  return { ...react, default: react }
})
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: object) => ({
    options,
    useSearch: () => ({ redirect: "/dashboard" }),
    useNavigate: () => mocks.navigate,
  }),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  redirect: vi.fn(),
}))
vi.mock("@tanstack/react-start", () => ({
  useServerFn: () => mocks.saveIntent,
}))
vi.mock("@/lib/auth-server", () => ({ getSession: vi.fn() }))
vi.mock("@/lib/onboarding", () => ({ saveOnboardingIntent: vi.fn() }))
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: { email: mocks.signIn, passkey: mocks.passkey },
    signUp: { email: mocks.signUp },
  },
}))
vi.mock("@/lib/email-verification", () => ({
  isPublicDevelopmentEmailVerificationBypassed: () => false,
}))
vi.mock("@/components/app/setup-auth-shell", () => ({
  setupAuthPrimaryButtonClassName: "",
  setupAuthSecondaryButtonClassName: "",
  SetupAuthShell: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}))

beforeEach(() => {
  vi.resetAllMocks()
})
afterEach(cleanup)

function fillField(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

function renderAuthForm(kind: "login" | "sign-up") {
  const Component = (kind === "login" ? LoginRoute : SignUpRoute).options
    .component
  if (!Component) throw new Error("Missing authentication form")
  const view = render(<Component />)
  fillField("Email", "jane@example.com")
  fillField("Password", "wrong-password")
  if (kind === "sign-up") {
    fillField("First name", "Jane")
    fillField("Last name", "Smith")
    fillField("Date of birth", "1990-01-01")
    fillField("Access code", "123456")
    fireEvent.click(screen.getByRole("checkbox"))
  }
  const form = view.container.querySelector("form")
  if (!form) throw new Error("Missing form element")
  const button = screen.getByRole<HTMLButtonElement>("button", {
    name: kind === "login" ? "Sign in" : "Continue",
  })
  return {
    form,
    button,
    request: kind === "login" ? mocks.signIn : mocks.signUp,
  }
}

describe.each(["login", "sign-up"] as const)(
  "%s submission recovery",
  (kind) => {
    it("shows loading during the request and allows repeated retries after rejection", async () => {
      const { form, button, request } = renderAuthForm(kind)
      let rejectCredentials = () => {}
      request.mockImplementation(
        () =>
          new Promise((resolve) => {
            rejectCredentials = () =>
              resolve({ error: { message: "Invalid credentials." } })
          })
      )

      for (let attempt = 1; attempt <= 2; attempt++) {
        fireEvent.submit(form)
        await waitFor(() => expect(request).toHaveBeenCalledTimes(attempt))
        expect(button.disabled).toBe(true)
        expect(button.textContent).toBe(
          kind === "login" ? "Signing in..." : "Creating account..."
        )
        if (kind === "login") {
          expect(
            screen.getByRole<HTMLButtonElement>("button", {
              name: "Use passkey",
            }).disabled
          ).toBe(true)
        }
        await act(() => rejectCredentials())
        await waitFor(() => expect(button.disabled).toBe(false))
        expect(button.textContent).toContain(
          kind === "login" ? "Sign in" : "Continue"
        )
        expect(screen.getByText("Invalid credentials.")).toBeTruthy()
        expect(screen.getByLabelText<HTMLInputElement>("Email").value).toBe(
          "jane@example.com"
        )
      }
      expect(mocks.navigate).not.toHaveBeenCalled()
      expect(mocks.saveIntent).not.toHaveBeenCalled()
    })

    it("shows a recoverable error when the request throws", async () => {
      const { form, button, request } = renderAuthForm(kind)
      request.mockRejectedValue(new TypeError("Failed to fetch"))
      fireEvent.submit(form)
      await waitFor(() =>
        expect(
          screen.getByText(
            kind === "login"
              ? "Unable to sign in. Try again."
              : "Unable to create account. Try again."
          )
        ).toBeTruthy()
      )
      await waitFor(() => expect(button.disabled).toBe(false))
    })

    it.each([
      ["Email", "invalid-email", "Enter a valid email address."],
      ["Password", "short", "Password must be at least 8 characters."],
    ])(
      "allows correction of invalid %s without making a request",
      async (label, value, message) => {
        const { form, button, request } = renderAuthForm(kind)
        fillField(label, value)
        fireEvent.submit(form)
        await waitFor(() => expect(screen.getByText(message)).toBeTruthy())
        await waitFor(() => expect(button.disabled).toBe(false))
        expect(request).not.toHaveBeenCalled()
        fillField(
          label,
          label === "Email" ? "jane@example.com" : "corrected-password"
        )
        request.mockResolvedValue({ error: { message: "Please try again." } })
        fireEvent.submit(form)
        await waitFor(() => expect(request).toHaveBeenCalledTimes(1))
        await waitFor(() => expect(button.disabled).toBe(false))
      }
    )
  }
)

it("releases both login buttons when passkey sign-in throws", async () => {
  const { button } = renderAuthForm("login")
  mocks.passkey.mockRejectedValue(new Error("Passkey unavailable."))
  const passkey = screen.getByRole<HTMLButtonElement>("button", {
    name: "Use passkey",
  })
  fireEvent.click(passkey)
  await waitFor(() =>
    expect(screen.getByText("Passkey unavailable.")).toBeTruthy()
  )
  expect(button.disabled).toBe(false)
  expect(passkey.disabled).toBe(false)
})

it("continues successful sign-up to email verification", async () => {
  const { form } = renderAuthForm("sign-up")
  mocks.signUp.mockResolvedValue({ error: null })
  fireEvent.submit(form)
  await waitFor(() =>
    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/verify-email",
      search: {
        email: "jane@example.com",
        redirect: "/onboarding/setup",
        sent: true,
      },
    })
  )
  expect(mocks.saveIntent).toHaveBeenCalledWith({
    data: { email: "jane@example.com", intent: "manage" },
  })
})
