import { UserRoundIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { SettingsSection } from "@/features/settings/components/settings-section"

function AccountProfileSection({
  user,
}: {
  user: { name: string; email: string; emailVerified: boolean }
}) {
  return (
    <SettingsSection
      title="Personal details"
      icon={UserRoundIcon}
      description="The name and email used for your RocketRota account."
    >
      <div className="py-3">
        <p className="text-xs font-bold text-[#14214a]">Your name</p>
        <p className="mt-1 text-xs text-[#657398]">{user.name}</p>
        <p className="mt-2 text-[11px] text-[#7180a2]">
          To correct your name, ask a manager to submit a support request.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 py-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#14214a]">Email address</p>
          <p className="mt-1 text-xs break-all text-[#657398]">{user.email}</p>
        </div>
        <Badge variant={user.emailVerified ? "outline" : "secondary"}>
          {user.emailVerified ? "Verified" : "Not verified"}
        </Badge>
      </div>
    </SettingsSection>
  )
}

export { AccountProfileSection }
