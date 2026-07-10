import "@tanstack/react-start/server-only"

import type Stripe from "stripe"

import {
  getCoreExtraEmployeeMeterEventName,
  getStripe,
  getTimeAttendanceEmployeeMeterEventName,
} from "@/features/billing/server/stripe"
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

  const organizationPeriods = await getDatabase().query<{ id: string }>(
    `insert into billing_private.organization_billing_periods (
       organization_id,
       billing_account_id,
       stripe_subscription_id,
       period_start,
       period_end
     )
     select organization_id, id, $2, $3, $4
     from public.billing_accounts
     where id = $1
       and organization_id is not null
     on conflict (billing_account_id, period_start, period_end)
     do update set stripe_subscription_id = excluded.stripe_subscription_id,
                   updated_at = timezone('utc', now())
     returning id`,
    [
      input.billingAccountId,
      input.stripeSubscriptionId,
      input.periodStart,
      input.periodEnd,
    ]
  )

  await Promise.all(
    organizationPeriods.rows.map((period) =>
      getDatabase().query(
        `select billing_private.capture_organization_period_usage($1::uuid)`,
        [period.id]
      )
    )
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
    `select billing_private.capture_organization_period_usage(id)
     from billing_private.organization_billing_periods
     where billing_account_id = $1
       and finalized_at is null
       and period_end <= timezone('utc', now())`,
    [billingAccountId]
  )

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

  await getDatabase().query(
    `with locked_periods as (
       select *
       from billing_private.organization_billing_periods
       where billing_account_id = $1
         and finalized_at is null
         and period_end <= timezone('utc', now())
       for update
     ),
     final_counts as (
       select
         period.id,
         count(distinct usage.employee_id)::integer as used_employee_count,
         count(distinct usage.employee_id) filter (
           where usage.time_attendance_billable
         )::integer as time_attendance_employee_count
       from locked_periods period
       left join billing_private.organization_employee_usage_events usage
         on usage.organization_billing_period_id = period.id
       group by period.id
     )
     update billing_private.organization_billing_periods period
     set used_employee_count = coalesce(final_counts.used_employee_count, 0),
         extra_employee_count = greatest(
           coalesce(final_counts.used_employee_count, 0) - period.included_employee_count,
           0
         ),
         time_attendance_employee_count = coalesce(
           final_counts.time_attendance_employee_count,
           0
         ),
         finalized_used_employee_count = coalesce(final_counts.used_employee_count, 0),
         finalized_extra_employee_count = greatest(
           coalesce(final_counts.used_employee_count, 0) - period.included_employee_count,
           0
         ),
         finalized_time_attendance_employee_count = coalesce(
           final_counts.time_attendance_employee_count,
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

type MeteredUsageItemType =
  | "core_extra_employee"
  | "time_attendance_employee"

type FinalizedUsagePeriodRow = {
  id: string
  period_end: Date | string
  stripe_customer_id: string | null
  core_extra_employee_quantity: number | string | null
  time_attendance_employee_quantity: number | string | null
  core_extra_subscription_item_id: string | null
  core_extra_is_metered: boolean | null
  time_attendance_subscription_item_id: string | null
  time_attendance_is_metered: boolean | null
}

type MeterSubmissionRow = {
  id: string
  status: "pending" | "submitted" | "skipped" | "failed"
}

async function submitEmployeeOverageMeter(billingAccountId: string) {
  const periods = await listFinalizedUsagePeriods(billingAccountId)
  let synced = false

  for (const period of periods) {
    const submissions = [
      {
        itemType: "core_extra_employee" as const,
        quantity: Number(period.core_extra_employee_quantity ?? 0),
        stripeSubscriptionItemId: period.core_extra_subscription_item_id,
        isMetered: period.core_extra_is_metered,
      },
      {
        itemType: "time_attendance_employee" as const,
        quantity: Number(period.time_attendance_employee_quantity ?? 0),
        stripeSubscriptionItemId: period.time_attendance_subscription_item_id,
        isMetered: period.time_attendance_is_metered,
      },
    ]

    for (const submission of submissions) {
      const wasSynced = await submitMeteredUsage({
        itemType: submission.itemType,
        organizationBillingPeriodId: period.id,
        periodEnd: new Date(period.period_end),
        quantity: submission.quantity,
        stripeCustomerId: period.stripe_customer_id,
        stripeSubscriptionItemId: submission.stripeSubscriptionItemId,
        isMetered: submission.isMetered,
      })

      synced ||= wasSynced
    }
  }

  return synced
}

async function listFinalizedUsagePeriods(billingAccountId: string) {
  const result = await getDatabase().query<FinalizedUsagePeriodRow>(
    `select
       period.id,
       period.period_end,
       account.stripe_customer_id,
       period.finalized_extra_employee_count as core_extra_employee_quantity,
       period.finalized_time_attendance_employee_count as time_attendance_employee_quantity,
       core_extra_item.stripe_subscription_item_id as core_extra_subscription_item_id,
       core_extra_item.is_metered as core_extra_is_metered,
       time_attendance_item.stripe_subscription_item_id as time_attendance_subscription_item_id,
       time_attendance_item.is_metered as time_attendance_is_metered
     from billing_private.organization_billing_periods period
     join public.billing_accounts account on account.id = period.billing_account_id
     left join public.billing_subscriptions subscription
       on subscription.stripe_subscription_id = period.stripe_subscription_id
     left join billing_private.billing_subscription_items core_extra_item
       on core_extra_item.billing_subscription_id = subscription.id
      and core_extra_item.item_type = 'core_extra_employee'
     left join billing_private.billing_subscription_items time_attendance_item
       on time_attendance_item.billing_subscription_id = subscription.id
      and time_attendance_item.item_type = 'time_attendance_employee'
     where period.billing_account_id = $1
       and period.finalized_at is not null
     order by period.period_end asc`,
    [billingAccountId]
  )

  return result.rows
}

async function submitMeteredUsage(input: {
  itemType: MeteredUsageItemType
  organizationBillingPeriodId: string
  periodEnd: Date
  quantity: number
  stripeCustomerId: string | null
  stripeSubscriptionItemId: string | null
  isMetered: boolean | null
}) {
  const identifier = buildMeterEventIdentifier({
    itemType: input.itemType,
    organizationBillingPeriodId: input.organizationBillingPeriodId,
  })
  const submission = await ensureMeterSubmission({
    itemType: input.itemType,
    organizationBillingPeriodId: input.organizationBillingPeriodId,
    quantity: input.quantity,
    stripeCustomerId: input.stripeCustomerId,
    stripeMeterEventIdentifier: identifier,
    stripeSubscriptionItemId: input.stripeSubscriptionItemId,
  })

  if (submission.status === "submitted" || submission.status === "skipped") {
    return false
  }

  if (input.quantity === 0) {
    await markMeterSubmissionSkipped(submission.id)
    return true
  }

  if (!input.stripeCustomerId) {
    await failMeterSubmission(submission.id, "Missing Stripe customer.")
    throw new Error("Cannot submit usage without a Stripe customer.")
  }

  if (!input.stripeSubscriptionItemId || input.isMetered !== true) {
    await failMeterSubmission(
      submission.id,
      `${input.itemType} is not attached as a metered subscription item.`
    )
    throw new Error(
      `${input.itemType} must be attached as a metered subscription item before usage can be reported.`
    )
  }

  try {
    await getStripe().billing.meterEvents.create({
      event_name: getMeterEventName(input.itemType),
      identifier,
      timestamp: getMeterEventTimestamp(input.periodEnd),
      payload: {
        stripe_customer_id: input.stripeCustomerId,
        value: String(input.quantity),
      },
    })
    await markMeterSubmissionSubmitted(submission.id)
    return true
  } catch (error) {
    await failMeterSubmission(
      submission.id,
      error instanceof Error ? error.message : "Stripe meter submission failed."
    )
    throw error
  }
}

async function ensureMeterSubmission(input: {
  itemType: MeteredUsageItemType
  organizationBillingPeriodId: string
  quantity: number
  stripeCustomerId: string | null
  stripeMeterEventIdentifier: string
  stripeSubscriptionItemId: string | null
}) {
  const result = await getDatabase().query<MeterSubmissionRow>(
    `insert into billing_private.billing_meter_submissions (
       organization_billing_period_id,
       item_type,
       stripe_customer_id,
       stripe_subscription_item_id,
       stripe_meter_event_identifier,
       quantity
     ) values ($1, $2, coalesce($3, ''), $4, $5, $6)
     on conflict (organization_billing_period_id, item_type)
     do update set stripe_customer_id = coalesce($3, billing_meter_submissions.stripe_customer_id),
                   stripe_subscription_item_id = coalesce(
                     $4,
                     billing_meter_submissions.stripe_subscription_item_id
                   ),
                   quantity = excluded.quantity,
                   status = case
                     when billing_meter_submissions.status in ('submitted', 'skipped')
                       then billing_meter_submissions.status
                     else 'pending'
                   end,
                   error_message = null,
                   updated_at = timezone('utc', now())
     returning id, status`,
    [
      input.organizationBillingPeriodId,
      input.itemType,
      input.stripeCustomerId,
      input.stripeSubscriptionItemId,
      input.stripeMeterEventIdentifier,
      input.quantity,
    ]
  )
  const row = result.rows.at(0)

  if (!row) {
    throw new Error("Could not prepare billing meter submission.")
  }

  return row
}

async function markMeterSubmissionSkipped(submissionId: string) {
  await getDatabase().query(
    `update billing_private.billing_meter_submissions
     set status = 'skipped',
         submitted_at = timezone('utc', now()),
         updated_at = timezone('utc', now())
     where id = $1`,
    [submissionId]
  )
}

async function markMeterSubmissionSubmitted(submissionId: string) {
  await getDatabase().query(
    `update billing_private.billing_meter_submissions
     set status = 'submitted',
         submitted_at = timezone('utc', now()),
         updated_at = timezone('utc', now())
     where id = $1`,
    [submissionId]
  )
}

async function failMeterSubmission(submissionId: string, message: string) {
  await getDatabase().query(
    `update billing_private.billing_meter_submissions
     set status = 'failed',
         error_message = left($2, 1000),
         updated_at = timezone('utc', now())
     where id = $1`,
    [submissionId, message]
  )
}

function getMeterEventName(itemType: MeteredUsageItemType) {
  return itemType === "core_extra_employee"
    ? getCoreExtraEmployeeMeterEventName()
    : getTimeAttendanceEmployeeMeterEventName()
}

function buildMeterEventIdentifier(input: {
  itemType: MeteredUsageItemType
  organizationBillingPeriodId: string
}) {
  return `${input.organizationBillingPeriodId}:${input.itemType}`
}

function getMeterEventTimestamp(periodEnd: Date) {
  return Math.floor(periodEnd.getTime() / 1000) - 60
}

export {
  finalizeEndedBillingPeriods,
  submitEmployeeOverageMeter,
  syncSubscriptionUsagePeriods,
}
