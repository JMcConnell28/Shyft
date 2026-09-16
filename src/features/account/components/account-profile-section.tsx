import { UserRoundIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAccountProfile } from "@/features/account/hooks/use-account-profile"
import { SettingsSection } from "@/features/settings/components/settings-section"

function AccountProfileSection({
  user,
}: {
  user: { name: string; email: string; emailVerified: boolean }
}) {
  const { name, setName, error, mutation } = useAccountProfile(user.name)

  return (
    <SettingsSection
      title="Personal details"
      icon={UserRoundIcon}
      description="The name and email used for your RocketRota account."
    >
      <div className="flex flex-wrap items-center justify-between gap-2 py-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#14214a]">Email address</p>
          <p className="mt-1 text-xs break-all text-[#657398]">{user.email}</p>
        </div>
        <Badge variant={user.emailVerified ? "outline" : "secondary"}>
          {user.emailVerified ? "Verified" : "Not verified"}
        </Badge>
      </div>
      <form
        className="space-y-3 py-3"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate()
        }}
      >
        <Field>
          <FieldLabel htmlFor="account-name">Your name</FieldLabel>
          <FieldContent>
            <Input
              id="account-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              maxLength={120}
              required
            />
            <FieldError>{error}</FieldError>
          </FieldContent>
        </Field>
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={mutation.isPending || !name.trim()}
          >
            {mutation.isPending ? "Saving..." : "Save details"}
          </Button>
        </div>
      </form>
    </SettingsSection>
  )
}

export { AccountProfileSection }
