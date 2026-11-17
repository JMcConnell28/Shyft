import "@tanstack/react-start/server-only"

import type Stripe from "stripe"
import { RENEWAL_CANCELED_AT_METADATA_KEY } from "@/features/billing/constants"
import { getStripe } from "@/features/billing/server/stripe"
import {
  openSubscriptionStatuses,
  upsertStripeSubscription,
} from "@/features/billing/server/subscriptions"
import {
  finalizeEndedBillingPeriods,
  submitEmployeeOverageMeter,
} from "@/features/billing/server/usage"
import { getDatabase } from "@/lib/db"

type WorkspaceBillingCustomer = {
  account_id: string | null
  customer_id: string | null
}

async function listWorkspaceBillingCustomers(organizationId: string) {
  const result = await getDatabase().query<WorkspaceBillingCustomer>(
    `select id as account_id, stripe_customer_id as customer_id
     from public.billing_accounts
     where organization_id = $1
     union all
     select null, organization."stripeCustomerId"
     from public."organization" organization
     where organization.id = $1
       and organization."stripeCustomerId" is not null
       and not exists (
         select 1 from public.billing_accounts
         where stripe_customer_id = organization."stripeCustomerId"
       )`,
    [organizationId]
  )
  return result.rows
}

async function expireSubscriptionCheckouts(
  customerId: string,
  assertHeld: () => void
) {
  const stripe = getStripe()
  for await (const session of stripe.checkout.sessions.list({
    customer: customerId,
    status: "open",
  })) {
    if (session.mode !== "subscription" && session.mode !== "setup") continue
    assertHeld()
    await stripe.checkout.sessions.expire(session.id)
  }
}

async function* openSubscriptions(customerId: string) {
  for await (const subscription of getStripe().subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100,
  })) {
    if (openSubscriptionStatuses.has(subscription.status)) yield subscription
  }
}

function getScheduledCancellation(subscription: Stripe.Subscription) {
  return (
    subscription.cancel_at ??
    (subscription.cancel_at_period_end
      ? (subscription.items.data.at(0)?.current_period_end ?? null)
      : null)
  )
}

async function cancelWorkspaceRenewal(
  organizationId: string,
  assertHeld: () => void
): Promise<{ endsAt: string | null }> {
  let latestEnd = 0
  const customers = await listWorkspaceBillingCustomers(organizationId)
  for (const { account_id: accountId, customer_id: customerId } of customers) {
    if (!customerId) continue
    await expireSubscriptionCheckouts(customerId, assertHeld)
    // Ignore delayed setup webhooks for Checkout sessions from before this request.
    assertHeld()
    await getStripe().customers.update(customerId, {
      metadata: {
        [RENEWAL_CANCELED_AT_METADATA_KEY]: String(
          Math.floor(Date.now() / 1000)
        ),
      },
    })
    for await (const subscription of openSubscriptions(customerId)) {
      assertHeld()
      const updated = await stopRenewal(subscription)
      latestEnd = Math.max(latestEnd, getScheduledCancellation(updated) ?? 0)

      if (accountId) await upsertStripeSubscription(updated)
    }
  }
  return { endsAt: latestEnd ? new Date(latestEnd * 1000).toISOString() : null }
}

function stopRenewal(subscription: Stripe.Subscription) {
  if (getScheduledCancellation(subscription)) return subscription
  const stripe = getStripe()
  if (
    subscription.status === "incomplete" ||
    subscription.status === "paused"
  ) {
    return stripe.subscriptions.cancel(subscription.id)
  }
  return stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: true,
  })
}

async function settleWorkspaceBillingForRemoval(
  organizationId: string,
  assertHeld: () => void
): Promise<void> {
  const customers = await listWorkspaceBillingCustomers(organizationId)
  for (const { customer_id: customerId } of customers) {
    if (!customerId) continue

    // A Checkout session that completes just before expiry can start a plan.
    // Check live subscriptions after expiring the open sessions.
    await expireSubscriptionCheckouts(customerId, assertHeld)
    for await (const _ of openSubscriptions(customerId)) {
      throw new Error(
        "Cancel your subscription in Billing and wait for it to end before removing this organisation."
      )
    }
  }

  for (const { account_id: accountId } of customers) {
    if (!accountId) continue
    await finalizeEndedBillingPeriods(accountId)
    await submitEmployeeOverageMeter(accountId)
  }
}

export { cancelWorkspaceRenewal, settleWorkspaceBillingForRemoval }
