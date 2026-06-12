"use client"

import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import {
  CheckCircle2Icon,
  KeyRoundIcon,
  MailIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react"

import {
  changeAccountPassword,
  requestPasswordReset,
  updateAccountProfile,
} from "@/features/account/server-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getErrorMessage } from "@/lib/errors"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

type AccountPageProps = {
  user: {
    email: string
    emailVerified: boolean
    name: string
  }
}

function AccountPage({ user }: AccountPageProps) {
  return (
    <div className="flex flex-1 flex-col gap-5 p-4 sm:p-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold tracking-tight">Account</h2>
        <p className="text-sm text-muted-foreground">
          Manage your personal details and password.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <AccountSummaryCard user={user} />
        <ProfileCard user={user} />
        <PasswordCard />
        <PasswordResetCard email={user.email} />
      </div>
    </div>
  )
}

function AccountSummaryCard({ user }: AccountPageProps) {
  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Account details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <SummaryRow icon={UserIcon} label="Name" value={user.name} />
        <SummaryRow icon={MailIcon} label="Email" value={user.email} />
        <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/10 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheckIcon className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Email status</span>
          </div>
          <Badge variant={user.emailVerified ? "outline" : "secondary"}>
            {user.emailVerified ? "Verified" : "Unverified"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/10 px-3 py-2.5">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  )
}

function ProfileCard({ user }: AccountPageProps) {
  const updateProfileFn = useServerFn(updateAccountProfile)
  const [name, setName] = React.useState(user.name)
  const [error, setError] = React.useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: () =>
      updateProfileFn({
        data: {
          name: name.trim(),
        },
      }),
    onSuccess: () => {
      setError(null)
      showSuccessToast("Profile updated.")
    },
    onError: (mutationError) => {
      const message = getErrorMessage(
        mutationError,
        "We could not update your profile.",
      )
      setError(message)
      showErrorToast(mutationError, {
        fallbackMessage: message,
      })
    },
  })

  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()

            if (!name.trim()) {
              setError("Enter your name.")
              return
            }

            mutation.mutate()
          }}
        >
          <Field>
            <FieldLabel htmlFor="account-name">Name</FieldLabel>
            <FieldContent>
              <Input
                id="account-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                maxLength={120}
              />
              <FieldError>{error}</FieldError>
            </FieldContent>
          </Field>
          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function PasswordCard() {
  const changePasswordFn = useServerFn(changeAccountPassword)
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: () =>
      changePasswordFn({
        data: {
          currentPassword,
          newPassword,
          confirmPassword,
        },
      }),
    onSuccess: () => {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setError(null)
      showSuccessToast("Password changed.")
    },
    onError: (mutationError) => {
      const message = getErrorMessage(
        mutationError,
        "We could not change your password.",
      )
      setError(message)
      showErrorToast(mutationError, {
        fallbackMessage: message,
      })
    },
  })

  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <KeyRoundIcon className="size-4 text-muted-foreground" />
          <CardTitle className="text-sm">Change password</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            mutation.mutate()
          }}
        >
          <PasswordInput
            id="current-password"
            label="Current password"
            value={currentPassword}
            autoComplete="current-password"
            onChange={setCurrentPassword}
          />
          <PasswordInput
            id="new-password"
            label="New password"
            value={newPassword}
            autoComplete="new-password"
            onChange={setNewPassword}
          />
          <PasswordInput
            id="confirm-password"
            label="Confirm new password"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={setConfirmPassword}
          />
          <FieldError>{error}</FieldError>
          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Updating..." : "Update password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function PasswordResetCard({ email }: { email: string }) {
  const requestPasswordResetFn = useServerFn(requestPasswordReset)
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
      showSuccessToast("Password reset email sent.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not send a password reset email.",
      })
    },
  })

  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Password reset email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FieldDescription>
          Send a reset link to your account email if you prefer changing your
          password from a secure email link.
        </FieldDescription>
        <Button
          type="button"
          variant="outline"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          <CheckCircle2Icon className="size-3.5" />
          {mutation.isPending ? "Sending..." : "Send reset email"}
        </Button>
      </CardContent>
    </Card>
  )
}

function PasswordInput({
  autoComplete,
  id,
  label,
  value,
  onChange,
}: {
  autoComplete: string
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
          value={value}
          type="password"
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
        />
      </FieldContent>
    </Field>
  )
}

export { AccountPage }
