import "@tanstack/react-start/server-only"

import type Stripe from "stripe"

import {
  ensureLocationBillingAccount,
  ensureOrganizationBillingAccount,
  setBillingAccountPaymentMethod,
} from "@/features/billing/server/billing-accounts"
import {
  buildSubscriptionItems,
  getBillingPricingQuantities,
} from "@/features/billing/server/pricing"
import {
  getExtraEmployeePriceId,
  getLocationPriceId,
  getStripe,
} from "@/features/billing/server/stripe"
import { ensureWorkspaceTrial } from "@/features/billing/server/trials"
import { getDatabase } from "@/lib/db"

const openSubscriptionStatuses = new Set([
  "incomplete",
  "trialing",
  "active",
  "past_due",
  "unpaid",
  "paused",
])
let hasPastDueStartedAtColumnCache: boolean | null = null

function toDate(value: number | null | undefined) {
  return typeof value === "number" ? new Date(value * 1000) : null
}

function getFirstSubscriptionItem(subscription: Stripe.Subscription) {
  return subscription.items.data.at(0) ?? null
}

function getBillingAccountIdFromSubscription(subscription: Stripe.Subscription) {
  return subscription.metadata.billingAccountId || null
}

function getBillingAccountIdFromCheckoutSession(
  session: Stripe.Checkout.Session,
) {
  return session.metadata?.billingAccountId || session.client_reference_id || null
}

async function findBillingAccountIdByStripeCustomer(stripeCustomerId: string) {
  const result = await getDatabase().query<{ id: string }>(
    `select id
     from public.billing_accounts
     where stripe_customer_id = $1
     limit 1`,
    [stripeCustomerId],
  )

  return result.rows.at(0)?.id ?? null
}

async function upsertStripeSubscription(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id
  const billingAccountId =
    getBillingAccountIdFromSubscription(subscription) ??
    await findBillingAccountIdByStripeCustomer(customerId)

  if (!billingAccountId) {
    throw new Error("Webhook subscription is missing a billing account.")
  }

  const firstItem = getFirstSubscriptionItem(subscription)
  const hasPastDueStartedAtColumn = await hasBillingSubscriptionColumn(
    "past_due_started_at",
  )

  if (hasPastDueStartedAtColumn) {
    await getDatabase().query(
    `insert into public.billing_subscriptions (
       billing_account_id,
       stripe_subscription_id,
       stripe_customer_id,
       stripe_price_id,
       status,
       quantity,
       current_period_start,
       current_period_end,
       cancel_at_period_end,
       past_due_started_at
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     on conflict (stripe_subscription_id)
     do update set billing_account_id = excluded.billing_account_id,
                   stripe_customer_id = excluded.stripe_customer_id,
                   stripe_price_id = excluded.stripe_price_id,
                   status = excluded.status,
                   quantity = excluded.quantity,
                   current_period_start = excluded.current_period_start,
                   current_period_end = excluded.current_period_end,
                   cancel_at_period_end = excluded.cancel_at_period_end,
                   past_due_started_at = case
                     when excluded.status = 'past_due'
                       and billing_subscriptions.status = 'past_due'
                       then billing_subscriptions.past_due_started_at
                     when excluded.status = 'past_due'
                       then coalesce(
                         billing_subscriptions.past_due_started_at,
                         excluded.past_due_started_at,
                         timezone('utc', now())
                       )
                     else null
                   end,
                   updated_at = timezone('utc', now())`,
    [
      billingAccountId,
      subscription.id,
      customerId,
      firstItem?.price.id ?? null,
      subscription.status,
      firstItem?.quantity ?? 1,
      toDate(firstItem?.current_period_start),
      toDate(firstItem?.current_period_end),
      subscription.cancel_at_period_end,
      subscription.status === "past_due" ? new Date() : null,
    ],
    )
  } else {
    await getDatabase().query(
      `insert into public.billing_subscriptions (
         billing_account_id,
         stripe_subscription_id,
         stripe_customer_id,
         stripe_price_id,
         status,
         quantity,
         current_period_start,
         current_period_end,
         cancel_at_period_end
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       on conflict (stripe_subscription_id)
       do update set billing_account_id = excluded.billing_account_id,
                     stripe_customer_id = excluded.stripe_customer_id,
                     stripe_price_id = excluded.stripe_price_id,
                     status = excluded.status,
                     quantity = excluded.quantity,
                     current_period_start = excluded.current_period_start,
                     current_period_end = excluded.current_period_end,
                     cancel_at_period_end = excluded.cancel_at_period_end,
                     updated_at = timezone('utc', now())`,
      [
        billingAccountId,
        subscription.id,
        customerId,
        firstItem?.price.id ?? null,
        subscription.status,
        firstItem?.quantity ?? 1,
        toDate(firstItem?.current_period_start),
        toDate(firstItem?.current_period_end),
        subscription.cancel_at_period_end,
      ],
    )
  }

  await getDatabase().query(
    `update public.billing_accounts
     set status = $2,
         stripe_customer_id = coalesce(stripe_customer_id, $3),
         updated_at = timezone('utc', now())
     where id = $1`,
    [billingAccountId, subscription.status, customerId],
  )
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

async function upsertStripeCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.mode === "setup") {
    await upsertSetupCheckoutSession(session)
    return
  }

  if (session.mode !== "subscription" || !session.subscription) {
    return
  }

  const billingAccountId = getBillingAccountIdFromCheckoutSession(session)
  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id

  if (billingAccountId && stripeCustomerId) {
    await getDatabase().query(
      `update public.billing_accounts
       set stripe_customer_id = coalesce(stripe_customer_id, $2),
           updated_at = timezone('utc', now())
       where id = $1`,
      [billingAccountId, stripeCustomerId],
    )
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId)

  await upsertStripeSubscription(subscription)
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  const subscription =
    invoice.parent?.subscription_details?.subscription ?? null

  if (!subscription) {
    return null
  }

  return typeof subscription === "string" ? subscription : subscription.id
}

async function syncSubscriptionFromInvoice(invoice: Stripe.Invoice) {
  const subscriptionId = getInvoiceSubscriptionId(invoice)

  if (!subscriptionId) {
    return null
  }

  const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
  await upsertStripeSubscription(subscription)

  return subscription
}

async function upsertSetupCheckoutSession(session: Stripe.Checkout.Session) {
  if (!session.setup_intent) {
    return
  }

  const billingAccountId = getBillingAccountIdFromCheckoutSession(session)

  if (!billingAccountId) {
    throw new Error("Setup checkout session is missing a billing account.")
  }

  const setupIntentId =
    typeof session.setup_intent === "string"
      ? session.setup_intent
      : session.setup_intent.id
  const setupIntent = await getStripe().setupIntents.retrieve(setupIntentId)
  const paymentMethodId =
    typeof setupIntent.payment_method === "string"
      ? setupIntent.payment_method
      : setupIntent.payment_method?.id

  if (!paymentMethodId || setupIntent.status !== "succeeded") {
    return
  }

  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id

  if (stripeCustomerId) {
    await getStripe().customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })
  }

  await setBillingAccountPaymentMethod({
    billingAccountId,
    stripePaymentMethodId: paymentMethodId,
  })
  await createTrialSubscriptionForSavedPaymentMethod({
    billingAccountId,
    locationId: getOptionalMetadataValue(session.metadata?.locationId),
    organizationId: getOptionalMetadataValue(session.metadata?.organizationId),
    stripeCustomerId,
    stripePaymentMethodId: paymentMethodId,
  })
}

function getOptionalMetadataValue(value: string | null | undefined) {
  return value && value.length > 0 ? value : undefined
}

async function createTrialSubscriptionForSavedPaymentMethod(input: {
  billingAccountId: string
  locationId?: string
  organizationId?: string
  stripeCustomerId?: string
  stripePaymentMethodId: string
}) {
  if (!input.stripeCustomerId) {
    return null
  }

  const existingDatabaseSubscription = await getOpenBillingSubscription(
    input.billingAccountId,
  )

  if (existingDatabaseSubscription) {
    return null
  }

  const existingStripeSubscription =
    await findOpenStripeSubscriptionForBillingAccount({
      billingAccountId: input.billingAccountId,
      stripeCustomerId: input.stripeCustomerId,
    })

  if (existingStripeSubscription) {
    return existingStripeSubscription
  }

  const trial = await ensureWorkspaceTrial({
    organizationId: input.organizationId,
    locationId: input.locationId,
  })
  const trialEnd = getFutureTrialEndTimestamp(trial.trialEndsAt)
  const quantities = await getBillingPricingQuantities(input.billingAccountId)
  const subscription = await getStripe().subscriptions.create({
    customer: input.stripeCustomerId,
    default_payment_method: input.stripePaymentMethodId,
    items: buildSubscriptionItems(quantities),
    metadata: {
      billingAccountId: input.billingAccountId,
      organizationId: input.organizationId ?? "",
      locationId: input.locationId ?? "",
      locationQuantity: String(quantities.locationQuantity),
      activeEmployeeQuantity: String(quantities.activeEmployeeQuantity),
      billableEmployeeQuantity: String(quantities.activeEmployeeQuantity),
      extraEmployeeQuantity: String(quantities.extraEmployeeQuantity),
      createdFrom: "saved_payment_method",
    },
    ...(trialEnd ? { trial_end: trialEnd } : {}),
  })

  await upsertStripeSubscription(subscription)

  return subscription
}

function getFutureTrialEndTimestamp(trialEndsAt: string) {
  const timestamp = Math.floor(new Date(trialEndsAt).getTime() / 1000)

  return timestamp > Math.floor(Date.now() / 1000) ? timestamp : null
}

async function syncCheckoutSessionForBillingAccount(input: {
  checkoutSessionId: string
  billingAccountId: string
}) {
  const session = await getStripe().checkout.sessions.retrieve(
    input.checkoutSessionId,
  )
  const sessionBillingAccountId = getBillingAccountIdFromCheckoutSession(session)

  if (sessionBillingAccountId !== input.billingAccountId) {
    throw new Error("That checkout session does not belong to this workspace.")
  }

  await upsertStripeCheckoutSession(session)
}

async function getOpenBillingSubscription(billingAccountId: string) {
  const result = await getDatabase().query<{
    stripe_subscription_id: string
    status: string
  }>(
    `select stripe_subscription_id, status
     from public.billing_subscriptions
     where billing_account_id = $1
       and status = any($2::text[])
     order by created_at desc
     limit 1`,
    [billingAccountId, Array.from(openSubscriptionStatuses)],
  )

  return result.rows.at(0) ?? null
}

async function findOpenStripeSubscriptionForBillingAccount(input: {
  billingAccountId: string
  stripeCustomerId: string
}) {
  const subscriptions = await getStripe().subscriptions.list({
    customer: input.stripeCustomerId,
    status: "all",
    limit: 100,
  })
  const matchingSubscription = subscriptions.data.find((subscription) => {
    return (
      subscription.metadata.billingAccountId === input.billingAccountId &&
      openSubscriptionStatuses.has(subscription.status)
    )
  })

  if (matchingSubscription) {
    await upsertStripeSubscription(matchingSubscription)
  }

  return matchingSubscription ?? null
}

async function refreshStripeSubscriptionsForBillingAccount(input: {
  billingAccountId: string
  stripeCustomerId: string
}) {
  const subscriptions = await getStripe().subscriptions.list({
    customer: input.stripeCustomerId,
    status: "all",
    limit: 100,
  })
  const matchingSubscriptions = subscriptions.data.filter((subscription) => {
    return subscription.metadata.billingAccountId === input.billingAccountId
  })

  await Promise.all(matchingSubscriptions.map(upsertStripeSubscription))

  if (matchingSubscriptions.length === 0) {
    await getDatabase().query(
      `update public.billing_accounts
       set status = 'incomplete',
           updated_at = timezone('utc', now())
       where id = $1`,
      [input.billingAccountId],
    )
  }

  return matchingSubscriptions
}

async function syncBillingSubscriptionQuantities(billingAccountId: string) {
  const openSubscription = await getOpenBillingSubscription(billingAccountId)

  if (!openSubscription) {
    return null
  }

  const stripe = getStripe()
  const subscription = await stripe.subscriptions.retrieve(
    openSubscription.stripe_subscription_id,
  )

  if (!openSubscriptionStatuses.has(subscription.status)) {
    await upsertStripeSubscription(subscription)
    return subscription
  }

  const quantities = await getBillingPricingQuantities(billingAccountId)
  const locationPriceId = getLocationPriceId()
  const locationItem = findSubscriptionItem(subscription, locationPriceId)

  if (!locationItem) {
    throw new Error("Stripe subscription is missing the location price item.")
  }

  if (locationItem.quantity !== quantities.locationQuantity) {
    await stripe.subscriptionItems.update(locationItem.id, {
      quantity: quantities.locationQuantity,
      proration_behavior: "create_prorations",
    })
  }

  const extraEmployeePriceId = getExtraEmployeePriceId()
  const extraEmployeeItem = findSubscriptionItem(
    subscription,
    extraEmployeePriceId,
  )

  if (quantities.extraEmployeeQuantity > 0) {
    if (extraEmployeeItem) {
      if (extraEmployeeItem.quantity !== quantities.extraEmployeeQuantity) {
        await stripe.subscriptionItems.update(extraEmployeeItem.id, {
          quantity: quantities.extraEmployeeQuantity,
          proration_behavior: "create_prorations",
        })
      }
    } else {
      await stripe.subscriptionItems.create({
        subscription: subscription.id,
        price: extraEmployeePriceId,
        quantity: quantities.extraEmployeeQuantity,
        proration_behavior: "create_prorations",
        metadata: {
          billingAccountId,
          billingItemType: "extra_employee",
        },
      })
    }
  } else if (extraEmployeeItem) {
    await stripe.subscriptionItems.del(extraEmployeeItem.id, {
      proration_behavior: "create_prorations",
    })
  }

  const updatedSubscription = await stripe.subscriptions.retrieve(subscription.id)
  await upsertStripeSubscription(updatedSubscription)

  return updatedSubscription
}

async function getBillingAccountLocationCount(billingAccountId: string) {
  const result = await getDatabase().query<{ count: string }>(
    `select count(*)::text
     from public.locations
     where billing_account_id = $1`,
    [billingAccountId],
  )

  return Number(result.rows.at(0)?.count ?? 0)
}

async function syncBillingAccountAfterCoverageChange(billingAccountId: string) {
  const locationCount = await getBillingAccountLocationCount(billingAccountId)
  const openSubscription = await getOpenBillingSubscription(billingAccountId)

  if (!openSubscription) {
    return null
  }

  if (locationCount > 0) {
    return syncBillingSubscriptionQuantities(billingAccountId)
  }

  const subscription = await getStripe().subscriptions.update(
    openSubscription.stripe_subscription_id,
    {
      cancel_at_period_end: true,
      metadata: {
        coverageEndedAt: new Date().toISOString(),
      },
    },
  )

  await upsertStripeSubscription(subscription)

  return subscription
}

async function syncWorkspaceBillingSubscriptionQuantities(input: {
  organizationId?: string
  locationId?: string
  userId?: string
}) {
  const billingAccount = input.organizationId
    ? await ensureOrganizationBillingAccount({
        organizationId: input.organizationId,
        ownerUserId: input.userId,
      })
    : input.locationId
      ? await ensureLocationBillingAccount({
          locationId: input.locationId,
          ownerUserId: input.userId,
        })
      : null

  if (!billingAccount) {
    return null
  }

  return syncBillingSubscriptionQuantities(billingAccount.id)
}

function findSubscriptionItem(
  subscription: Stripe.Subscription,
  priceId: string,
) {
  return subscription.items.data.find((item) => item.price.id === priceId) ?? null
}

export {
  findOpenStripeSubscriptionForBillingAccount,
  getOpenBillingSubscription,
  openSubscriptionStatuses,
  refreshStripeSubscriptionsForBillingAccount,
  syncBillingAccountAfterCoverageChange,
  syncBillingSubscriptionQuantities,
  syncCheckoutSessionForBillingAccount,
  syncSubscriptionFromInvoice,
  syncWorkspaceBillingSubscriptionQuantities,
  upsertStripeCheckoutSession,
  upsertStripeSubscription,
}
