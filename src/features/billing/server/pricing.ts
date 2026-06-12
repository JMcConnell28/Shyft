import "@tanstack/react-start/server-only"

import type Stripe from "stripe"

import {
  getExtraEmployeePriceId,
  getLocationPriceId,
} from "@/features/billing/server/stripe"
import { getDatabase } from "@/lib/db"

const INCLUDED_EMPLOYEES_PER_LOCATION = 10

type BillingPricingQuantities = {
  locationQuantity: number
  activeEmployeeQuantity: number
  includedEmployeeQuantity: number
  extraEmployeeQuantity: number
}

type BillingPricingCountRow = {
  location_count: string
  billable_employee_count: string
}

async function getBillingPricingQuantities(
  billingAccountId: string,
): Promise<BillingPricingQuantities> {
  const result = await getDatabase().query<BillingPricingCountRow>(
    `with covered_locations as (
       select id
       from public.locations
       where billing_account_id = $1
     ),
     billing_period as (
       select current_period_start,
              current_period_end
       from public.billing_subscriptions
       where billing_account_id = $1
         and status = any(array[
           'incomplete',
           'trialing',
           'active',
           'past_due',
           'unpaid',
           'paused'
         ]::text[])
         and current_period_start is not null
         and current_period_end is not null
       order by created_at desc
       limit 1
     ),
     covered_employees as (
       select employee.id
       from public.employee_location_assignments assignment
       join public.employees employee on employee.id = assignment.employee_id
       join covered_locations on covered_locations.id = assignment.location_id
       where employee.status = 'active'
         and assignment.is_enabled = true
         and assignment.disabled_at is null

       union

       select employee.id
       from public.employees employee
       join covered_locations on covered_locations.id = employee.location_id
       where employee.status = 'active'

       union

       select assignment.employee_id as id
       from public.rota_shift_assignments assignment
       join public.rota_shifts shift on shift.id = assignment.rota_shift_id
       join public.rotas rota on rota.id = shift.rota_id
       join covered_locations on covered_locations.id = rota.location_id
       cross join billing_period
       where shift.day_date >= billing_period.current_period_start::date
         and shift.day_date < billing_period.current_period_end::date

       union

       select assignment.employee_id as id
       from public.rota_published_shift_assignments assignment
       join public.rota_published_shifts shift
         on shift.id = assignment.rota_published_shift_id
       join public.rotas rota on rota.id = shift.rota_id
       join covered_locations on covered_locations.id = rota.location_id
       cross join billing_period
       where shift.day_date >= billing_period.current_period_start::date
         and shift.day_date < billing_period.current_period_end::date
     )
     select
       (select count(*)::text from covered_locations) as location_count,
       (select count(distinct id)::text from covered_employees) as billable_employee_count`,
    [billingAccountId],
  )
  const row = result.rows.at(0)
  const locationQuantity = Math.max(Number(row?.location_count ?? 0), 1)
  const activeEmployeeQuantity = Math.max(
    Number(row?.billable_employee_count ?? 0),
    0,
  )
  const includedEmployeeQuantity =
    locationQuantity * INCLUDED_EMPLOYEES_PER_LOCATION
  const extraEmployeeQuantity = Math.max(
    activeEmployeeQuantity - includedEmployeeQuantity,
    0,
  )

  return {
    locationQuantity,
    activeEmployeeQuantity,
    includedEmployeeQuantity,
    extraEmployeeQuantity,
  }
}

function buildSubscriptionLineItems(
  quantities: BillingPricingQuantities,
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price: getLocationPriceId(),
      quantity: quantities.locationQuantity,
    },
  ]

  if (quantities.extraEmployeeQuantity > 0) {
    lineItems.push({
      price: getExtraEmployeePriceId(),
      quantity: quantities.extraEmployeeQuantity,
    })
  }

  return lineItems
}

function buildSubscriptionItems(
  quantities: BillingPricingQuantities,
): Stripe.SubscriptionCreateParams.Item[] {
  const items: Stripe.SubscriptionCreateParams.Item[] = [
    {
      price: getLocationPriceId(),
      quantity: quantities.locationQuantity,
    },
  ]

  if (quantities.extraEmployeeQuantity > 0) {
    items.push({
      price: getExtraEmployeePriceId(),
      quantity: quantities.extraEmployeeQuantity,
    })
  }

  return items
}

export {
  INCLUDED_EMPLOYEES_PER_LOCATION,
  buildSubscriptionLineItems,
  buildSubscriptionItems,
  getBillingPricingQuantities,
}
export type { BillingPricingQuantities }
