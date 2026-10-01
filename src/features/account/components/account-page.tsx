"use client"

import type { OrganizationSummary } from "@/features/onboarding/types"
import { AccountProfileSection } from "@/features/account/components/account-profile-section"
import { AccountOrganizationsSection } from "@/features/account/components/account-organizations-section"
import { AccountPasswordSection } from "@/features/account/components/account-password-section"
import { PasskeyCard } from "@/features/account/components/passkey-card"
import { AccountDangerZone } from "@/features/account/components/account-danger-zone"
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
        <AccountDangerZone />
      </div>
    </div>
  )
}

export { AccountPage }
