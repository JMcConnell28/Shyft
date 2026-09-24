import type { WorkspaceBillingState } from "@/features/billing/types"
import {
  CORE_MONTHLY_PRICE_PENCE,
  EXTRA_EMPLOYEE_MONTHLY_PRICE_PENCE,
  TIME_ATTENDANCE_MONTHLY_PRICE_PENCE,
  formatMonthlyPrice,
  getMonthlyPricing,
} from "@/features/billing/utils/monthly-pricing"
import { INCLUDED_CORE_EMPLOYEES } from "@/features/billing/utils/pricing-quantities"

function BillingMonthlyPrice({
  billing,
}: {
  billing: WorkspaceBillingState | null
}) {
  const pricing = billing ? getMonthlyPricing(billing) : null

  return (
    <div className="py-4">
      <div className="rounded-xl border border-[#dce6f8] bg-[#f5f8ff] p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-[#14214a]">Monthly pricing</h3>
          <span className="rounded-md border border-[#d6e2f7] bg-white px-2 py-1 text-[10px] font-bold tracking-wide text-[#46577d] uppercase">
            Monthly
          </span>
        </div>

        <dl className="mt-4 space-y-3 text-[11px] text-[#46577d]">
          <PriceLine
            label={`Core plan · ${INCLUDED_CORE_EMPLOYEES} used employees included`}
            value={formatMonthlyPrice(CORE_MONTHLY_PRICE_PENCE)}
          />
          <PriceLine
            label={
              billing
                ? `Extra employees · ${billing.extraEmployeeQuantity} × ${formatMonthlyPrice(EXTRA_EMPLOYEE_MONTHLY_PRICE_PENCE)}`
                : "Extra employees"
            }
            value={
              pricing
                ? formatMonthlyPrice(pricing.extraEmployeePrice)
                : `${formatMonthlyPrice(EXTRA_EMPLOYEE_MONTHLY_PRICE_PENCE)} each`
            }
          />
          <PriceLine
            label={
              billing
                ? `Time & Attendance · ${billing.timeAttendanceQuantity} × ${formatMonthlyPrice(TIME_ATTENDANCE_MONTHLY_PRICE_PENCE)}`
                : "Time & Attendance"
            }
            value={
              pricing
                ? formatMonthlyPrice(pricing.timeAttendancePrice)
                : `${formatMonthlyPrice(TIME_ATTENDANCE_MONTHLY_PRICE_PENCE)} per employee`
            }
          />
        </dl>

        <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-[#dce6f8] pt-3 text-[#14214a]">
          <span className="text-xs font-bold">
            {pricing ? "Estimated monthly total" : "Starting monthly price"}
          </span>
          <span className="text-lg font-extrabold tabular-nums">
            {formatMonthlyPrice(
              pricing?.totalPrice ?? CORE_MONTHLY_PRICE_PENCE
            )}
          </span>
        </div>
        <p className="mt-2 text-[10px] leading-4 font-medium text-[#7180a2] sm:text-[11px]">
          {pricing
            ? "Based on usage so far this billing period. Employee charges can rise as more staff use the app."
            : "Employee charges depend on usage during the billing period."}{" "}
          Prices exclude VAT. The fixed fee is billed in advance and employee
          usage in arrears.
        </p>
      </div>
    </div>
  )
}

function PriceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt>{label}</dt>
      <dd className="shrink-0 font-bold text-[#14214a] tabular-nums">
        {value}
      </dd>
    </div>
  )
}

export { BillingMonthlyPrice }
