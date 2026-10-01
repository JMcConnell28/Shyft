import { LogOutIcon } from "lucide-react"

import { SignOutButton } from "@/components/app/sign-out-button"
import { SettingsSection } from "@/features/settings/components/settings-section"

function AccountDangerZone() {
  return (
    <SettingsSection
      title="Danger zone"
      icon={LogOutIcon}
      description="Manage your sign-in on this device."
    >
      <div className="flex items-center justify-between gap-4 py-3">
        <div>
          <p className="text-xs font-bold text-[#14214a]">Log out</p>
          <p className="mt-1 text-[11px] text-[#7180a2]">
            You'll need to sign in again to access your account.
          </p>
        </div>
        <SignOutButton
          showIcon
          className="h-8 gap-2 rounded-lg border border-[#f2d5d2] bg-[#fff4f2] px-3 font-semibold text-[#b42318] hover:bg-[#fee4e2] hover:text-[#b42318]"
        />
      </div>
    </SettingsSection>
  )
}

export { AccountDangerZone }
