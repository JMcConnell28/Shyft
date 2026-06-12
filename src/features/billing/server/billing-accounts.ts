import "@tanstack/react-start/server-only"

import { getDatabase } from "@/lib/db"
import type {
  BillingSubscriptionStatus,
  WorkspaceBillingState,
} from "@/features/billing/types"
import {
  INCLUDED_EMPLOYEES_PER_LOCATION,
  getBillingPricingQuantities,
} from "@/features/billing/server/pricing"
import { PAST_DUE_GRACE_DAYS } from "@/features/billing/constants"

const activeSubscriptionStatuses = new Set(["active", "trialing"])
const subscriptionStatuses: Array<BillingSubscriptionStatus> = [
  "incomplete",
  "payment_method_saved",
  "incomplete_expired",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "paused",
]

type BillingAccountRow = {
  id: string
  stripe_customer_id: string | null
  stripe_payment_method_id: string | null
  payment_method_saved_at: Date | string | null
}

type BillingSubscriptionRow = {
  status: string
  past_due_started_at: Date | string | null
}

type BillingAccessRow = BillingAccountRow & {
  subscription_status: string | null
  past_due_started_at: Date | string | null
}

let hasPastDueStartedAtColumnCache: boolean | null = null

function mapBillingAccess(row: BillingAccessRow): WorkspaceBillingState {
  const subscriptionStatus = parseSubscriptionStatus(row.subscription_status)
  const paymentMethodSavedAt = row.payment_method_saved_at
    ? new Date(row.payment_method_saved_at).toISOString()
    : null
  const pastDueStartedAt = row.past_due_started_at
    ? new Date(row.past_due_started_at)
    : null
  const pastDueGraceEndsAt = pastDueStartedAt
    ? addDays(pastDueStartedAt, PAST_DUE_GRACE_DAYS)
    : null

  return {
    billingAccountId: row.id,
    stripeCustomerId: row.stripe_customer_id,
    stripePaymentMethodId: row.stripe_payment_method_id,
    paymentMethodSavedAt,
    subscriptionStatus,
    pastDueStartedAt: pastDueStartedAt?.toISOString() ?? null,
    pastDueGraceEndsAt: pastDueGraceEndsAt?.toISOString() ?? null,
    isPastDueGraceActive:
      subscriptionStatus === "past_due" &&
      pastDueGraceEndsAt !== null &&
      pastDueGraceEndsAt.getTime() > Date.now(),
    locationQuantity: 1,
    activeEmployeeQuantity: 0,
    includedEmployeeQuantity: INCLUDED_EMPLOYEES_PER_LOCATION,
    extraEmployeeQuantity: 0,
    hasActiveSubscription:
      subscriptionStatus !== null &&
      activeSubscriptionStatuses.has(subscriptionStatus),
    hasSavedPaymentMethod: Boolean(row.stripe_payment_method_id),
  }
}

function parseSubscriptionStatus(
  value: string | null,
): BillingSubscriptionStatus | null {
  return subscriptionStatuses.find((status) => status === value) ?? null
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)

  return nextDate
}

async function ensureLocationBillingAccount(input: {
  locationId: string
  ownerUserId?: string | null
}) {
  const database = getDatabase()
  const result = await database.query<BillingAccountRow>(
    `with location_row as (
       select id, organization_id, billing_account_id
       from public.locations
       where id = $1
       for update
     ),
     created_account as (
       insert into public.billing_accounts (
         scope,
         organization_id,
         location_id,
         owner_user_id
       )
       select 'location', organization_id, id, $2
       from location_row
       where billing_account_id is null
       returning id
     ),
     updated_location as (
       update public.locations l
       set billing_account_id = created_account.id
       from created_account
       where l.id = $1
       returning l.billing_account_id
     )
     select ba.id,
            ba.stripe_customer_id,
            ba.stripe_payment_method_id,
            ba.payment_method_saved_at
     from public.billing_accounts ba
     where ba.id = coalesce(
       (select billing_account_id from updated_location),
       (select billing_account_id from location_row)
     )`,
    [input.locationId, input.ownerUserId ?? null],
  )

  const account = result.rows.at(0)

  if (!account) {
    throw new Error("We could not find billing for this location.")
  }

  return account
}

async function ensureOrganizationBillingAccount(input: {
  organizationId: string
  ownerUserId?: string | null
}) {
  const database = getDatabase()
  const result = await database.query<BillingAccountRow>(
    `with existing_account as (
       select id
       from public.billing_accounts
       where scope = 'organization'
         and organization_id = $1
       limit 1
     ),
     created_account as (
       insert into public.billing_accounts (
         scope,
         organization_id,
         owner_user_id
       )
       select 'organization', $1, $2
       where not exists (select 1 from existing_account)
       returning id
     ),
     chosen_account as (
       select id from existing_account
       union all
       select id from created_account
       limit 1
     ),
     updated_locations as (
       update public.locations
       set billing_account_id = (select id from chosen_account)
       where organization_id = $1
       returning id
     )
     select ba.id,
            ba.stripe_customer_id,
            ba.stripe_payment_method_id,
            ba.payment_method_saved_at
     from public.billing_accounts ba
     where ba.id = (select id from chosen_account)`,
    [input.organizationId, input.ownerUserId ?? null],
  )

  const account = result.rows.at(0)

  if (!account) {
    throw new Error("We could not create billing for this organization.")
  }

  return account
}

async function setBillingAccountStripeCustomer(input: {
  billingAccountId: string
  stripeCustomerId: string
}) {
  await getDatabase().query(
    `update public.billing_accounts
     set stripe_customer_id = $2,
         updated_at = timezone('utc', now())
     where id = $1`,
    [input.billingAccountId, input.stripeCustomerId],
  )
}

async function setBillingAccountPaymentMethod(input: {
  billingAccountId: string
  stripePaymentMethodId: string
}) {
  await getDatabase().query(
    `update public.billing_accounts
     set stripe_payment_method_id = $2,
         payment_method_saved_at = timezone('utc', now()),
         status = case
                    when status in ('active', 'trialing') then status
                    else 'payment_method_saved'
                  end,
         updated_at = timezone('utc', now())
     where id = $1`,
    [input.billingAccountId, input.stripePaymentMethodId],
  )
}

async function getBillingAccountLocationQuantity(billingAccountId: string) {
  const result = await getDatabase().query<{ count: string }>(
    `select count(*)::text
     from public.locations
     where billing_account_id = $1`,
    [billingAccountId],
  )

  return Math.max(Number(result.rows.at(0)?.count ?? 0), 1)
}

async function getLocationBillingAccess(locationId: string) {
  await ensureLocationBillingAccount({ locationId })

  const hasPastDueStartedAtColumn = await hasBillingSubscriptionColumn(
    "past_due_started_at",
  )
  const pastDueStartedAtSelect = hasPastDueStartedAtColumn
    ? "past_due_started_at"
    : "case when status = 'past_due' then updated_at else null end as past_due_started_at"
  const result = await getDatabase().query<BillingAccessRow>(
    `select
       ba.id,
       ba.stripe_customer_id,
       ba.stripe_payment_method_id,
       ba.payment_method_saved_at,
       subscription.status as subscription_status,
       subscription.past_due_started_at
     from public.locations l
     join public.billing_accounts ba on ba.id = l.billing_account_id
     left join lateral (
       select status,
              ${pastDueStartedAtSelect}
       from public.billing_subscriptions
       where billing_account_id = ba.id
       order by created_at desc
       limit 1
     ) subscription on true
     where l.id = $1`,
    [locationId],
  )

  const row = result.rows.at(0)

  if (!row) {
    throw new Error("We could not load billing for this location.")
  }

  return {
    ...mapBillingAccess(row),
    ...(await getBillingPricingQuantities(row.id)),
  }
}

async function getOrganizationBillingAccess(organizationId: string) {
  const hasPastDueStartedAtColumn = await hasBillingSubscriptionColumn(
    "past_due_started_at",
  )
  const pastDueStartedAtSelect = hasPastDueStartedAtColumn
    ? "past_due_started_at"
    : "case when status = 'past_due' then updated_at else null end as past_due_started_at"
  const accountResult = await getDatabase().query<BillingAccountRow>(
    `select id,
            stripe_customer_id,
            stripe_payment_method_id,
            payment_method_saved_at
     from public.billing_accounts
     where scope = 'organization'
       and organization_id = $1
     limit 1`,
    [organizationId],
  )
  const account = accountResult.rows.at(0)

  if (!account) {
    return null
  }

  const subscriptionResult = await getDatabase().query<BillingSubscriptionRow>(
    `select status,
            ${pastDueStartedAtSelect}
     from public.billing_subscriptions
     where billing_account_id = $1
     order by created_at desc
     limit 1`,
    [account.id],
  )
  const subscription = subscriptionResult.rows.at(0) ?? null

  return {
    ...mapBillingAccess({
      id: account.id,
      stripe_customer_id: account.stripe_customer_id,
      stripe_payment_method_id: account.stripe_payment_method_id,
      payment_method_saved_at: account.payment_method_saved_at,
      subscription_status: subscription?.status ?? null,
      past_due_started_at: subscription?.past_due_started_at ?? null,
    }),
    ...(await getBillingPricingQuantities(account.id)),
  }
}

async function hasBillingSubscriptionColumn(columnName: string) {
  if (
    columnName === "past_due_started_at" &&
    hasPastDueStartedAtColumnCache !== null
  ) {
    return hasPastDueStartedAtColumnCache
  }

  const result = await getDatabase().query<{ exists: boolean }>(
    `select exists (
       select 1
       from information_schema.columns
       where table_schema = 'public'
         and table_name = 'billing_subscriptions'
         and column_name = $1
     )`,
    [columnName],
  )
  const exists = result.rows.at(0)?.exists ?? false

  if (columnName === "past_due_started_at") {
    hasPastDueStartedAtColumnCache = exists
  }

  return exists
}

export {
  activeSubscriptionStatuses,
  ensureLocationBillingAccount,
  ensureOrganizationBillingAccount,
  getBillingAccountLocationQuantity,
  getLocationBillingAccess,
  getOrganizationBillingAccess,
  setBillingAccountPaymentMethod,
  setBillingAccountStripeCustomer,
}
