import { UsersRoundIcon } from "lucide-react"

import type { WorkspaceBillingState } from "@/features/billing/types"
import {
  BillingSettingRow,
  BillingSettingValue,
} from "@/features/billing/components/billing-setting-row"
import { getEmployeeDescription } from "@/features/billing/utils/billing-settings"
import { SettingsSection } from "@/features/settings/components/settings-section"

function BillingUsageSection({
  billing,
}: {
  billing: WorkspaceBillingState | null
}) {
  return (
    <SettingsSection
      description="Employees counted during the current billing period."
      icon={UsersRoundIcon}
      title="Usage & pricing"
    >
      <BillingSettingRow
        description={getEmployeeDescription(billing)}
        title="Billable staff"
      >
        <BillingSettingValue>
          {billing?.usedEmployeeQuantity ?? 0} counted
        </BillingSettingValue>
      </BillingSettingRow>
      <BillingSettingRow
        description="£2.50 per used employee above the included allowance."
        title="Extra employees"
      >
        <BillingSettingValue>
          {billing?.extraEmployeeQuantity ?? 0} billable
        </BillingSettingValue>
      </BillingSettingRow>
      <BillingSettingRow
        description="£1 per used employee in enabled locations."
        title="Time & Attendance"
      >
        <BillingSettingValue>
          {billing?.timeAttendanceQuantity ?? 0} employees
        </BillingSettingValue>
      </BillingSettingRow>
      <p className="py-3 text-[10px] leading-4 font-medium text-[#7180a2] sm:text-[11px]">
        Fixed fees are billed in advance. Employee usage is billed in arrears,
        plus VAT where applicable.
      </p>
    </SettingsSection>
  )
}

export { BillingUsageSection }
