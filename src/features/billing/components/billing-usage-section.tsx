import { UsersRoundIcon } from "lucide-react"

import type { WorkspaceBillingState } from "@/features/billing/types"
import { BillingMonthlyPrice } from "@/features/billing/components/billing-monthly-price"
import {
  BillingSettingRow,
  BillingSettingValue,
} from "@/features/billing/components/billing-setting-row"
import { getEmployeeDescription } from "@/features/billing/utils/billing-settings"
import {
  EXTRA_EMPLOYEE_MONTHLY_PRICE_PENCE,
  TIME_ATTENDANCE_MONTHLY_PRICE_PENCE,
  formatMonthlyPrice,
} from "@/features/billing/utils/monthly-pricing"
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
        description={`${formatMonthlyPrice(EXTRA_EMPLOYEE_MONTHLY_PRICE_PENCE)} per used employee above the included allowance.`}
        title="Extra employees"
      >
        <BillingSettingValue>
          {billing?.extraEmployeeQuantity ?? 0} billable
        </BillingSettingValue>
      </BillingSettingRow>
      <BillingSettingRow
        description={`${formatMonthlyPrice(TIME_ATTENDANCE_MONTHLY_PRICE_PENCE)} per used employee in enabled locations.`}
        title="Time & Attendance"
      >
        <BillingSettingValue>
          {billing?.timeAttendanceQuantity ?? 0} employees
        </BillingSettingValue>
      </BillingSettingRow>
      <BillingMonthlyPrice billing={billing} />
    </SettingsSection>
  )
}

export { BillingUsageSection }
