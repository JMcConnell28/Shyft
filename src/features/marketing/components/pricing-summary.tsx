import { CheckIcon } from "lucide-react"

import type { PricingBreakdown } from "../pricing-types"
import { formatGbp } from "../utils/pricing"
import { PreviewTrialLink } from "./landing-preview/preview-trial-link"

export function PricingSummary({ pricing }: { pricing: PricingBreakdown }) {
  return (
    <aside className="pricing-summary" aria-labelledby="pricing-summary-title">
      <p className="marketing-eyebrow" id="pricing-summary-title">
        Your monthly estimate
      </p>
      <p className="pricing-summary-total">
        <output aria-label="Estimated monthly total" aria-live="polite">
          {formatGbp(pricing.totalPrice)}
        </output>
        <span>/ month</span>
      </p>
      <p className="pricing-summary-context">
        {pricing.employeeCount} employees across {pricing.locationCount}{" "}
        {pricing.locationCount === 1 ? "location" : "locations"}
      </p>
      <dl className="pricing-summary-breakdown">
        <div>
          <dt>
            Core plan{" "}
            <small>{pricing.includedEmployees} employees included</small>
          </dt>
          <dd>{formatGbp(pricing.basePrice)}</dd>
        </div>
        <div>
          <dt>
            Additional employees{" "}
            <small>{pricing.extraEmployees} beyond your included team</small>
          </dt>
          <dd>{formatGbp(pricing.extraPrice)}</dd>
        </div>
        <div>
          <dt>
            Time & Attendance{" "}
            <small>
              {pricing.timeAttendancePrice === 0
                ? "No additional clocking costs"
                : "Additional clocking employees"}
            </small>
          </dt>
          <dd>{formatGbp(pricing.timeAttendancePrice)}</dd>
        </div>
      </dl>
      <p className="pricing-summary-vat">
        Excluding VAT. Your bill reflects actual employee usage.
      </p>
      <PreviewTrialLink />
      <p className="pricing-summary-trial">
        <CheckIcon size={13} aria-hidden="true" />
        14 days free. No credit card needed.
      </p>
    </aside>
  )
}
