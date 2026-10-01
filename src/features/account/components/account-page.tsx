"use client"

import type { OrganizationSummary } from "@/features/onboarding/types"
import { AccountProfileSection } from "@/features/account/components/account-profile-section"
import { AccountOrganizationsSection } from "@/features/account/components/account-organizations-section"
import { AccountPasswordSection } from "@/features/account/components/account-password-section"
import { PasskeyCard } from "@/features/account/components/passkey-card"
import { SignOutButton } from "@/components/app/sign-out-button"
import { PwaInstallCard } from "@/features/pwa/components/pwa-install-card"

type AccountPageProps = {
  user: { email: string; emailVerified: boolean; name: string }
  organizations: Array<OrganizationSummary>
  activeOrganizationId: string | null
}

function AccountPage({
  user,
  organizations,
  activeOrganizationId,
}: AccountPageProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="settings-content min-w-0 space-y-3">
        <AccountOrganizationsSection
          organizations={organizations}
          activeOrganizationId={activeOrganizationId}
        />
        <AccountProfileSection user={user} />
        <PasskeyCard />
        <AccountPasswordSection email={user.email} />
        <PwaInstallCard />
      </div>
      <footer className="mt-auto flex justify-end border-t border-[#dfe4ef] pt-5">
        <SignOutButton
          showIcon
          className="h-9 gap-2 rounded-lg border border-[#f2d5d2] px-3 text-[#b42318] hover:bg-[#fff4f2] hover:text-[#b42318]"
        />
      </footer>
    </div>
  )
}

export { AccountPage }
