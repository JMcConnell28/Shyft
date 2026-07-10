import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { createFileRoute } from "@tanstack/react-router"
import { MailIcon } from "lucide-react"

import { AuthShell } from "@/components/app/auth-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
          "We could not send a password reset email.",
        ),
      )
    },
  })

  return (
    <AuthShell
      badge="Account recovery"
      eyebrow="Forgot password"
      title="Get back into your RocketRota account."
      description="Enter your email and we will send a secure reset link if the account exists."
      alternateLabel="Remembered your password?"
      alternateHref="/login"
    >
      <Card className="border border-border/60 bg-background/90 shadow-2xl shadow-slate-950/10 backdrop-blur">
        <CardHeader>
          <MailIcon className="size-5 text-muted-foreground" />
          <CardTitle className="mt-2 text-2xl">Reset by email</CardTitle>
          <CardDescription>
            The link expires automatically for account safety.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {didSend ? (
            <p className="text-sm text-muted-foreground">
              If that email exists, a reset link is on its way.
            </p>
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
                    autoComplete="email"
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <FieldError>{error}</FieldError>
                </FieldContent>
              </Field>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  )
}
