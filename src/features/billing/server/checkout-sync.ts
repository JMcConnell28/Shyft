import "@tanstack/react-start/server-only"

import type Stripe from "stripe"
import { upsertSetupCheckoutSession } from "@/features/billing/server/setup-checkout"
import { getStripe } from "@/features/billing/server/stripe"
import { upsertStripeSubscription } from "@/features/billing/server/subscriptions"
import { getDatabase } from "@/lib/db"

type SubscriptionCheckoutSession = Pick<
  Stripe.Checkout.Session,
  | "id"
  | "mode"
  | "status"
  | "created"
  | "customer"
  | "setup_intent"
  | "metadata"
  | "subscription"
  | "client_reference_id"
>

function getBillingAccountIdFromCheckoutSession(
  session: SubscriptionCheckoutSession
) {
  return (
    session.metadata?.billingAccountId || session.client_reference_id || null
  )
}

async function upsertStripeCheckoutSession(
  session: SubscriptionCheckoutSession
) {
  if (session.mode === "setup") {
    await upsertSetupCheckoutSession(
      session,
      getBillingAccountIdFromCheckoutSession(session)
    )
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
      [billingAccountId, stripeCustomerId]
    )
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId)

  await upsertStripeSubscription(subscription)
}

async function syncCheckoutSessionForBillingAccount(input: {
  checkoutSessionId: string
  billingAccountId: string
}) {
  const session = await getStripe().checkout.sessions.retrieve(
    input.checkoutSessionId
  )
  const sessionBillingAccountId =
    getBillingAccountIdFromCheckoutSession(session)

  if (sessionBillingAccountId !== input.billingAccountId) {
    throw new Error("That checkout session does not belong to this workspace.")
  }

  await upsertStripeCheckoutSession(session)
}

export { syncCheckoutSessionForBillingAccount, upsertStripeCheckoutSession }
