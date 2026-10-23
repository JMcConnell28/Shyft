"use client"

import type { BillingSettingsPageProps } from "@/features/billing/types"
import { BillingSubscriptionSection } from "@/features/billing/components/billing-subscription-section"
import { BillingTrialNotice } from "@/features/billing/components/billing-trial-notice"
import { BillingUsageSection } from "@/features/billing/components/billing-usage-section"
import { getBillingStatus } from "@/features/billing/utils/billing-settings"
import { StationPurchaseSection } from "@/features/station-purchases/components/station-purchase-section"

function BillingSettingsPage({
  billing,
  trial,
  organizationId,
  locationId,
  canManageStations = false,
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
      {canManageStations &&
        billing?.locations
          .filter((location) => location.timeAttendanceEnabled)
          .map((location) => (
            <StationPurchaseSection
              key={location.locationId}
              locationId={location.locationId}
              locationName={location.locationName}
            />
          ))}
    </div>
  )
}

export { BillingSettingsPage }
