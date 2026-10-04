import "@tanstack/react-start/server-only"

import type Stripe from "stripe"

import {
  getCoreBasePriceId,
  getCoreExtraEmployeeMeterEventName,
  getCoreExtraEmployeePriceId,
  getStripe,
  getTimeAttendanceEmployeeMeterEventName,
  getTimeAttendanceEmployeePriceId,
} from "@/features/billing/server/stripe"
import {
  CORE_MONTHLY_PRICE_PENCE,
  EXTRA_EMPLOYEE_MONTHLY_PRICE_PENCE,
  TIME_ATTENDANCE_MONTHLY_PRICE_PENCE,
} from "@/features/billing/utils/monthly-pricing"

async function validateSubscriptionPrices(): Promise<void> {
  const stripe = getStripe()
  const [base, extraEmployees, timeAttendance] = await Promise.all([
    stripe.prices.retrieve(getCoreBasePriceId()),
    stripe.prices.retrieve(getCoreExtraEmployeePriceId()),
    stripe.prices.retrieve(getTimeAttendanceEmployeePriceId()),
  ])

  assertMonthlyPrice(base, CORE_MONTHLY_PRICE_PENCE, "Core")
  if (base.recurring?.usage_type !== "licensed") {
    throw new Error("Core must use a fixed monthly Stripe price.")
  }

  await Promise.all([
    validateMeteredEmployeePrice(
      extraEmployees,
      EXTRA_EMPLOYEE_MONTHLY_PRICE_PENCE,
      getCoreExtraEmployeeMeterEventName(),
      "Extra employees"
    ),
    validateMeteredEmployeePrice(
      timeAttendance,
      TIME_ATTENDANCE_MONTHLY_PRICE_PENCE,
      getTimeAttendanceEmployeeMeterEventName(),
      "Time & Attendance"
    ),
  ])
}

function assertMonthlyPrice(
  price: Stripe.Price,
  amount: number,
  label: string
): void {
  if (
    !price.active ||
    price.currency !== "gbp" ||
    price.billing_scheme !== "per_unit" ||
    price.unit_amount !== amount ||
    price.recurring?.interval !== "month" ||
    price.recurring.interval_count !== 1 ||
    price.transform_quantity !== null ||
    price.tax_behavior !== "exclusive"
  ) {
    throw new Error(
      `${label} has an incompatible Stripe price. Check the monthly GBP price and VAT configuration.`
    )
  }
}

async function validateMeteredEmployeePrice(
  price: Stripe.Price,
  amount: number,
  eventName: string,
  label: string
): Promise<void> {
  assertMonthlyPrice(price, amount, label)
  const meterId = price.recurring?.meter
  if (price.recurring?.usage_type !== "metered" || !meterId) {
    throw new Error(
      `${label} must use a metered Stripe price with a billing meter. A fixed price would charge merely for enabling the feature.`
    )
  }
  const meter = await getStripe().billing.meters.retrieve(meterId)
  if (
    meter.status !== "active" ||
    meter.event_name !== eventName ||
    meter.default_aggregation.formula !== "sum" ||
    meter.customer_mapping.event_payload_key !== "stripe_customer_id" ||
    meter.value_settings.event_payload_key !== "value" ||
    meter.event_time_window !== null
  ) {
    throw new Error(`${label} has an incompatible Stripe billing meter.`)
  }
}

export { validateSubscriptionPrices }
