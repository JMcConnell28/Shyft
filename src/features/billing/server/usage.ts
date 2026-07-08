import "@tanstack/react-start/server-only"

import type Stripe from "stripe"

import { getDatabase } from "@/lib/db"

function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  const periodItem = subscription.items.data.at(0)

  if (!periodItem?.current_period_start || !periodItem.current_period_end) {
    return null
  }

  return {
    periodStart: new Date(periodItem.current_period_start * 1000),
    periodEnd: new Date(periodItem.current_period_end * 1000),
  }
}

async function ensureLocationBillingPeriods(input: {
  billingAccountId: string
  stripeSubscriptionId: string
  periodStart: Date
  periodEnd: Date
}) {
  await getDatabase().query(
    `insert into billing_private.location_billing_periods (
       location_id,
       billing_account_id,
       stripe_subscription_id,
       period_start,
       period_end
     )
     select id, $1, $2, $3, $4
     from public.locations
     where billing_account_id = $1
     on conflict (location_id, period_start, period_end)
     do update set billing_account_id = excluded.billing_account_id,
                   stripe_subscription_id = excluded.stripe_subscription_id,
                   updated_at = timezone('utc', now())`,
    [
      input.billingAccountId,
      input.stripeSubscriptionId,
      input.periodStart,
      input.periodEnd,
    ]
  )

  await getDatabase().query(
    `select billing_private.capture_location_usage(id, 'reconciliation')
     from public.locations
     where billing_account_id = $1`,
    [input.billingAccountId]
  )
}

async function syncSubscriptionUsagePeriods(input: {
  billingAccountId: string
  subscription: Stripe.Subscription
}) {
  const period = getSubscriptionPeriod(input.subscription)

  if (!period) return

  await ensureLocationBillingPeriods({
    billingAccountId: input.billingAccountId,
    stripeSubscriptionId: input.subscription.id,
    ...period,
  })
}

async function finalizeEndedBillingPeriods(billingAccountId: string) {
  await getDatabase().query(
    `with final_counts as (
       select
         id,
         greatest(
           high_water_employee_count,
           billing_private.qualifying_employee_count(location_id, period_start, period_end)
         ) as employee_count
       from billing_private.location_billing_periods
       where billing_account_id = $1
         and finalized_at is null
         and period_end <= timezone('utc', now())
       for update
     )
     update billing_private.location_billing_periods period
     set high_water_employee_count = final_counts.employee_count,
         finalized_employee_count = final_counts.employee_count,
         finalized_overage_count = greatest(
           final_counts.employee_count - period.included_employee_count,
           0
         ),
         finalized_at = timezone('utc', now()),
         last_observed_at = timezone('utc', now()),
         updated_at = timezone('utc', now())
     from final_counts
     where period.id = final_counts.id`,
    [billingAccountId]
  )
}

async function submitEmployeeOverageMeter(billingAccountId: string) {
  void billingAccountId
  return false
}

export {
  finalizeEndedBillingPeriods,
  submitEmployeeOverageMeter,
  syncSubscriptionUsagePeriods,
}
