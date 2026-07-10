import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { getOptionalAdminRouteSession } from "@/features/auth/server-fns"
import { authClient } from "@/lib/auth-client"

type LoginMode = "sign-in" | "bootstrap-sign-up"

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const session = await getOptionalAdminRouteSession()

    if (session) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = React.useState<LoginMode>("sign-in")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isPending, setIsPending] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    setError(null)

    const normalizedEmail = email.trim()
    const result =
      mode === "bootstrap-sign-up"
        ? await authClient.signUp.email({
            email: normalizedEmail,
            name: normalizedEmail,
            password,
          })
        : await authClient.signIn.email({
            email: normalizedEmail,
            password,
          })

    setIsPending(false)

    if (result.error) {
      setError(
        result.error.message ??
          (mode === "bootstrap-sign-up"
            ? "We could not create that admin account."
            : "We could not sign you in."),
      )
      return
    }

    await navigate({ to: "/dashboard" })
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <form
        className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <div>
          <h1 className="text-xl font-semibold">RocketRota Admin</h1>
          <p className="text-sm text-slate-500">
            {mode === "bootstrap-sign-up"
              ? "Create the temporary bootstrap admin account."
              : "Sign in with a provisioned admin account."}
          </p>
        </div>
        <label className="block space-y-1 text-sm font-medium">
          <span>Email</span>
          <input
            autoComplete="email"
            className="h-10 w-full rounded-md border border-slate-200 px-3"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="block space-y-1 text-sm font-medium">
          <span>Password</span>
          <input
            autoComplete={
              mode === "bootstrap-sign-up" ? "new-password" : "current-password"
            }
            className="h-10 w-full rounded-md border border-slate-200 px-3"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button className="w-full" disabled={isPending} type="submit">
          {isPending
            ? "Working..."
            : mode === "bootstrap-sign-up"
              ? "Create admin account"
              : "Sign in"}
        </Button>
        <div className="border-t border-slate-200 pt-3 text-center">
          <button
            className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
            onClick={() => {
              setError(null)
              setMode((currentMode) =>
                currentMode === "sign-in" ? "bootstrap-sign-up" : "sign-in",
              )
            }}
            type="button"
          >
            {mode === "bootstrap-sign-up"
              ? "Back to sign in"
              : "Create bootstrap admin account"}
          </button>
        </div>
      </form>
    </main>
  )
}
