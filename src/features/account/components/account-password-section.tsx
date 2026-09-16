import { KeyRoundIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAccountPassword } from "@/features/account/hooks/use-account-password"
import { usePasswordResetEmail } from "@/features/account/hooks/use-password-reset-email"
import { SettingsSection } from "@/features/settings/components/settings-section"

function AccountPasswordSection({ email }: { email: string }) {
  const form = useAccountPassword()

  return (
    <SettingsSection
      title="Password"
      icon={KeyRoundIcon}
      description="Change your password here. Your other signed-in sessions will be signed out."
    >
      <form
        className="space-y-3 py-3"
        onSubmit={(event) => {
          event.preventDefault()
          form.mutation.mutate()
        }}
      >
        <PasswordInput
          id="current-password"
          label="Current password"
          value={form.currentPassword}
          autoComplete="current-password"
          onChange={form.setCurrentPassword}
        />
        <div className="grid gap-3 lg:grid-cols-2">
          <PasswordInput
            id="new-password"
            label="New password"
            value={form.newPassword}
            autoComplete="new-password"
            onChange={form.setNewPassword}
          />
          <PasswordInput
            id="confirm-password"
            label="Confirm new password"
            value={form.confirmPassword}
            autoComplete="new-password"
            onChange={form.setConfirmPassword}
          />
        </div>
        <FieldError>{form.error}</FieldError>
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={form.mutation.isPending}>
            {form.mutation.isPending ? "Updating..." : "Change password"}
          </Button>
        </div>
      </form>
      <PasswordResetOption email={email} />
    </SettingsSection>
  )
}

function PasswordResetOption({ email }: { email: string }) {
  const { mutation } = usePasswordResetEmail(email)
  return (
    <div className="flex flex-col items-start justify-between gap-3 py-3 sm:flex-row sm:items-center">
      <div>
        <p className="text-xs font-bold text-[#14214a]">
          Forgot your current password?
        </p>
        <p className="mt-1 text-[11px] text-[#7180a2]">
          We can email you a link to choose a new one.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? "Sending..." : "Email reset link"}
      </Button>
    </div>
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
          required
          onChange={(event) => onChange(event.target.value)}
        />
      </FieldContent>
    </Field>
  )
}

export { AccountPasswordSection }
