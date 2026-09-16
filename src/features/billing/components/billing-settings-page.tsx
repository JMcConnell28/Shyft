"use client"

import type { BillingSettingsPageProps } from "@/features/billing/types"
import { BillingLocationUsageSection } from "@/features/billing/components/billing-location-usage-section"
import { BillingOrganizationOverviewSection } from "@/features/billing/components/billing-organization-overview-section"
import { BillingSubscriptionSection } from "@/features/billing/components/billing-subscription-section"
import { BillingTrialNotice } from "@/features/billing/components/billing-trial-notice"
import { BillingUsageSection } from "@/features/billing/components/billing-usage-section"
import { getBillingStatus } from "@/features/billing/utils/billing-settings"

function BillingSettingsPage({
  billing,
  trial,
  organizationId,
  locationId,
  organizationLocations = [],
}: BillingSettingsPageProps) {
  const status = getBillingStatus({ billing, trial })

  return (
    <div className="space-y-3">
      <BillingTrialNotice billing={billing} trial={trial} />
      <BillingSubscriptionSection
        billing={billing}
        locationId={locationId}
        organizationId={organizationId}
        status={status}
        trial={trial}
      />
      <BillingUsageSection billing={billing} />
      <BillingLocationUsageSection
        activeLocationId={locationId}
        locations={billing?.locations ?? []}
      />
      <BillingOrganizationOverviewSection locations={organizationLocations} />
    </div>
  )
}

export { BillingSettingsPage }
