"use client"

import type { OrganizationSummary } from "@/features/onboarding/types"
import { AccountProfileSection } from "@/features/account/components/account-profile-section"
import { AccountOrganizationsSection } from "@/features/account/components/account-organizations-section"
import { AccountPasswordSection } from "@/features/account/components/account-password-section"
import { PasskeyCard } from "@/features/account/components/passkey-card"
import { SignOutButton } from "@/components/app/sign-out-button"
import { PwaInstallCard } from "@/features/pwa/components/pwa-install-card"
import { NotificationSettingsCard } from "@/features/push-notifications/components/notification-settings-card"

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
    <div className="flex min-w-0 flex-1 flex-col bg-[#f6f8fc] px-4 py-5 text-[#10204b] sm:px-5 sm:py-6 lg:px-7">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-[-0.035em]">Account</h1>
        <p className="mt-1 text-xs font-medium text-[#657398]">
          Your personal details, sign-in options and notifications.
        </p>
      </header>
      <div className="settings-content min-w-0 space-y-3">
        <AccountOrganizationsSection
          organizations={organizations}
          activeOrganizationId={activeOrganizationId}
        />
        <AccountProfileSection user={user} />
        <PasskeyCard />
        <AccountPasswordSection email={user.email} />
        <NotificationSettingsCard />
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
