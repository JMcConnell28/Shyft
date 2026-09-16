import { MapPinnedIcon } from "lucide-react"

import type { BillingPeriodUsage } from "@/features/billing/types"
import {
  BillingSettingValue,
  BillingStatusPill,
} from "@/features/billing/components/billing-setting-row"
import { TimeAttendanceAddonButton } from "@/features/billing/components/time-attendance-addon-button"
import { SettingsSection } from "@/features/settings/components/settings-section"

function BillingLocationUsageSection({
  activeLocationId,
  locations,
}: {
  activeLocationId?: string | null
  locations: Array<BillingPeriodUsage>
}) {
  if (locations.length === 0) return null

  return (
    <SettingsSection
      description="Current usage and add-ons for each billed location."
      icon={MapPinnedIcon}
      title="Location usage"
    >
      {locations.map((location) => (
        <div
          className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
          key={location.locationId}
        >
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-[#14214a]">
              {location.locationName}
            </p>
            <p className="mt-0.5 text-[10px] leading-3.5 font-medium text-[#7180a2] sm:text-[11px]">
              {location.usedEmployeeCount} used staff this period ·{" "}
              {location.includedEmployeeCount} included
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {activeLocationId === location.locationId ? (
              <TimeAttendanceAddonButton
                cancelAt={location.timeAttendanceCancelAt}
                enabled={location.timeAttendanceEnabled}
                hardwareEntitlementAvailable={
                  location.hardwareEntitlementAvailable
                }
                locationId={location.locationId}
                status={location.timeAttendanceStatus}
              />
            ) : location.timeAttendanceEnabled ? (
              <BillingStatusPill label="Time & Attendance" tone="positive" />
            ) : (
              <BillingSettingValue>Core</BillingSettingValue>
            )}
          </div>
        </div>
      ))}
    </SettingsSection>
  )
}

export { BillingLocationUsageSection }
