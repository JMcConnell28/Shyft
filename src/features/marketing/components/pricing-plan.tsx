import { CheckIcon } from "lucide-react"
import {
  CORE_BASE_PRICE_GBP,
  EXTRA_EMPLOYEE_PRICE_GBP,
  INCLUDED_CORE_EMPLOYEES,
  TIME_ATTENDANCE_EMPLOYEE_PRICE_GBP,
  formatGbp,
} from "../utils/pricing"

export function PricingPlan() {
  return (
    <div className="pricing-plan" aria-label="RocketRota pricing at a glance">
      <section className="pricing-plan-core">
        <p className="marketing-eyebrow">RocketRota Core</p>
        <p className="pricing-plan-price">
          {formatGbp(CORE_BASE_PRICE_GBP)}
          <span>/ month</span>
        </p>
        <p>
          Your first {INCLUDED_CORE_EMPLOYEES} used employees.
          <br />
          Every location. One connected workspace.
        </p>
        <span className="pricing-plan-inclusion">
          <CheckIcon size={14} aria-hidden="true" />
          Unlimited locations included
        </span>
      </section>
      <section>
        <p className="pricing-plan-label">Room for more people</p>
        <p className="pricing-plan-additional-price">
          {formatGbp(EXTRA_EMPLOYEE_PRICE_GBP)}
          <span>/ employee</span>
        </p>
        <p>
          Per additional used employee, per month, after your first{" "}
          {INCLUDED_CORE_EMPLOYEES}.
        </p>
        <small>Across your whole organisation.</small>
      </section>
      <section>
        <p className="pricing-plan-label">Optional Time & Attendance</p>
        <p className="pricing-plan-additional-price">
          +{formatGbp(TIME_ATTENDANCE_EMPLOYEE_PRICE_GBP)}
          <span>/ employee</span>
        </p>
        <p>
          The first {INCLUDED_CORE_EMPLOYEES} used staff at each enabled
          location are included.
        </p>
        <small>Per extra clocking employee, per month.</small>
      </section>
      <p className="pricing-plan-vat">
        All prices exclude VAT. Only employees used in published rotas or
        timesheet activity count.
      </p>
    </div>
  )
}
