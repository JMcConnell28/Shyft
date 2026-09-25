import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { createFileRoute } from "@tanstack/react-router"
import { ArrowRightIcon } from "lucide-react"

import { AuthStatusMessage } from "@/components/app/auth-card"
import {
  SetupAuthShell,
  setupAuthPrimaryButtonClassName,
} from "@/components/app/setup-auth-shell"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { requestPasswordReset } from "@/features/account/server-fns"
import { getErrorMessage } from "@/lib/errors"

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password | RocketRota" },
      {
        name: "description",
        content: "Request a RocketRota password reset link.",
      },
    ],
  }),
  component: ForgotPasswordRoute,
})

function ForgotPasswordRoute() {
  const requestPasswordResetFn = useServerFn(requestPasswordReset)
  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [didSend, setDidSend] = React.useState(false)
  const mutation = useMutation({
    mutationFn: () =>
      requestPasswordResetFn({
        data: {
          email,
          redirectTo:
            typeof window === "undefined"
              ? "/reset-password"
              : `${window.location.origin}/reset-password`,
        },
      }),
    onSuccess: () => {
      setDidSend(true)
      setError(null)
    },
    onError: (mutationError) => {
      setError(
        getErrorMessage(
          mutationError,
          "We could not send a password reset email."
        )
      )
    },
  })

  return (
    <SetupAuthShell
      title="Forgot your password?"
      description="Enter your email and we will send a secure reset link if the account exists."
      alternateLabel="Remembered your password?"
      alternateAction="Back to sign in"
      alternateHref="/login"
      alternateRedirect="/dashboard"
      showArtwork={false}
    >
      {didSend ? (
        <AuthStatusMessage tone="neutral">
          <p>If that email exists, a reset link is on its way.</p>
        </AuthStatusMessage>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            mutation.mutate()
          }}
        >
          <Field>
            <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
            <FieldContent>
              <Input
                id="forgot-email"
                value={email}
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
                onChange={(event) => setEmail(event.target.value)}
              />
              <FieldError>{error}</FieldError>
            </FieldContent>
          </Field>
          <Button
            type="submit"
            size="lg"
            className={setupAuthPrimaryButtonClassName}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Sending..." : "Send reset link"}
            {!mutation.isPending ? <ArrowRightIcon className="size-4" /> : null}
          </Button>
        </form>
      )}
    </SetupAuthShell>
  )
}
