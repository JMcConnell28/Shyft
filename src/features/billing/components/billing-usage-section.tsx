import { UsersRoundIcon } from "lucide-react"

import type { WorkspaceBillingState } from "@/features/billing/types"
import { BillingMonthlyPrice } from "@/features/billing/components/billing-monthly-price"
import { SettingsSection } from "@/features/settings/components/settings-section"

function BillingUsageSection({
  billing,
}: {
  billing: WorkspaceBillingState | null
}) {
  return (
    <SettingsSection
      description="Your plan and employee charges for the current billing period."
      icon={UsersRoundIcon}
      title="Usage & pricing"
    >
      <BillingMonthlyPrice billing={billing} />
    </SettingsSection>
  )
}

export { BillingUsageSection }
