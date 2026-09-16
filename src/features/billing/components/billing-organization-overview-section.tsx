import { Building2Icon } from "lucide-react"

import type {
  BillingSettingsStatus,
  OrganizationBillingLocationSummary,
} from "@/features/billing/types"
import { BillingStatusPill } from "@/features/billing/components/billing-setting-row"
import { formatBillingDate } from "@/features/billing/utils/billing-settings"
import { SettingsSection } from "@/features/settings/components/settings-section"

function BillingOrganizationOverviewSection({
  locations,
}: {
  locations: Array<OrganizationBillingLocationSummary>
}) {
  if (locations.length === 0) return null

  return (
    <SettingsSection
      description="Billing coverage and access across the organisation."
      icon={Building2Icon}
      title="Organisation coverage"
    >
      {locations.map((location) => (
        <div
          className="flex flex-col gap-2.5 py-3 sm:flex-row sm:items-center sm:justify-between"
          key={location.locationId}
        >
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-[#14214a]">
              {location.locationName}
            </p>
            <p className="mt-0.5 text-[10px] leading-3.5 font-medium text-[#7180a2] sm:text-[11px]">
              {location.payerLabel}
              {location.renewalDate
                ? ` · renews ${formatBillingDate(location.renewalDate)}`
                : ""}
            </p>
            <p className="mt-1 text-[10px] font-medium text-[#7180a2]">
              {location.usedEmployeeCount} used staff
              {location.timeAttendanceStatus
                ? ` · Time & Attendance ${location.timeAttendanceStatus}`
                : ""}
            </p>
            {location.transfer ? (
              <p className="mt-1 text-[10px] font-bold text-blue-600">
                Billing transfer scheduled for{" "}
                {formatBillingDate(location.transfer.effectiveAt)}
              </p>
            ) : null}
          </div>
          <BillingStatusPill
            label={location.accessState}
            tone={getAccessTone(location.accessState)}
          />
        </div>
      ))}
    </SettingsSection>
  )
}

function getAccessTone(
  state: OrganizationBillingLocationSummary["accessState"]
): BillingSettingsStatus["tone"] {
  if (state === "active") return "positive"
  if (state === "grace") return "warning"
  if (state === "recovery") return "danger"
  return "neutral"
}

export { BillingOrganizationOverviewSection }
