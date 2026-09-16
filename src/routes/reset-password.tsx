import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { Link, createFileRoute } from "@tanstack/react-router"
import { KeyRoundIcon } from "lucide-react"

import {
  AuthCard,
  AuthStatusMessage,
  authButtonClassName,
} from "@/components/app/auth-card"
import { AuthShell } from "@/components/app/auth-shell"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { resetPassword } from "@/features/account/server-fns"
import { getErrorMessage } from "@/lib/errors"
import { showSuccessToast } from "@/lib/toast"

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search) => ({
    token: typeof search.token === "string" ? search.token : "",
    error: typeof search.error === "string" ? search.error : "",
  }),
  head: () => ({
    meta: [
      { title: "Reset password | RocketRota" },
      {
        name: "description",
        content: "Choose a new RocketRota account password.",
      },
    ],
  }),
  component: ResetPasswordRoute,
})

function ResetPasswordRoute() {
  const search = Route.useSearch()
  const resetPasswordFn = useServerFn(resetPassword)
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(
    search.error ? "This reset link is invalid or has expired." : null
  )
  const [didReset, setDidReset] = React.useState(false)
  const mutation = useMutation({
    mutationFn: () =>
      resetPasswordFn({
        data: {
          token: search.token,
          newPassword,
          confirmPassword,
        },
      }),
    onSuccess: () => {
      setDidReset(true)
      setError(null)
      showSuccessToast("Password reset.")
    },
    onError: (mutationError) => {
      setError(
        getErrorMessage(mutationError, "We could not reset your password.")
      )
    },
  })

  return (
    <AuthShell
      eyebrow="Account security"
      title="Choose a new password"
      description="Use the secure link from your email to finish resetting your password."
      alternateLabel="Remembered your password?"
      alternateAction="Back to sign in"
      alternateHref="/login"
    >
      <AuthCard
        icon={KeyRoundIcon}
        title="Reset password"
        description="Enter a new password to use the next time you sign in."
      >
        {didReset ? (
          <div className="space-y-4">
            <AuthStatusMessage>
              <p>Your password has been reset.</p>
            </AuthStatusMessage>
            <Button
              className={authButtonClassName}
              nativeButton={false}
              render={<Link to="/login" search={{ redirect: "/dashboard" }} />}
            >
              Sign in
            </Button>
          </div>
        ) : (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault()
              mutation.mutate()
            }}
          >
            <PasswordField
              id="reset-new-password"
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
            />
            <PasswordField
              id="reset-confirm-password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
            <FieldError>{error}</FieldError>
            <Button
              type="submit"
              size="lg"
              className={authButtonClassName}
              disabled={mutation.isPending || !search.token}
            >
              {mutation.isPending ? "Resetting..." : "Reset password"}
            </Button>
          </form>
        )}
      </AuthCard>
    </AuthShell>
  )
}

function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <FieldContent>
        <Input
          id={id}
          type="password"
          autoComplete="new-password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </FieldContent>
    </Field>
  )
}
