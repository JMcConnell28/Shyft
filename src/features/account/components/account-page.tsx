"use client"

import { AccountProfileSection } from "@/features/account/components/account-profile-section"
import { AccountPasswordSection } from "@/features/account/components/account-password-section"
import { PasskeyCard } from "@/features/account/components/passkey-card"
import { PwaInstallCard } from "@/features/pwa/components/pwa-install-card"
import { NotificationSettingsCard } from "@/features/push-notifications/components/notification-settings-card"

type AccountPageProps = {
  user: { email: string; emailVerified: boolean; name: string }
}

function AccountPage({ user }: AccountPageProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[#f6f8fc] px-4 py-5 text-[#10204b] sm:px-5 sm:py-6 lg:px-7">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-[-0.035em]">Account</h1>
        <p className="mt-1 text-xs font-medium text-[#657398]">
          Your personal details, sign-in options and notifications.
        </p>
      </header>
      <div className="settings-content min-w-0 space-y-3">
        <AccountProfileSection user={user} />
        <PasskeyCard />
        <AccountPasswordSection email={user.email} />
        <NotificationSettingsCard />
        <PwaInstallCard />
      </div>
    </div>
  )
}

export { AccountPage }
