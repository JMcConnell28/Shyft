import "@tanstack/react-start/server-only"

import { z } from "zod"

import * as riskReferences from "@/features/billing/server/payment-risk-references"
import { upsertStripeSubscription } from "@/features/billing/server/subscriptions"
import { getDatabase } from "@/lib/db"

const accountSchema = z.object({ id: z.uuid() })

async function recordPaymentRisk(
  event: riskReferences.PaymentRiskEvent
): Promise<void> {
  const { charge, subscriptionIds } =
    await riskReferences.resolvePaymentRiskReferences(event)
  const database = getDatabase()
  const accounts = await database.query(
    "select id from public.billing_accounts where stripe_customer_id = $1",
    [charge.customer]
  )
  const account = accounts.rows[0]
    ? accountSchema.parse(accounts.rows[0])
    : null
  const kind =
    event.type === "charge.refunded"
      ? "refund"
      : event.type === "charge.dispute.created"
        ? "dispute"
        : "fraud_warning"
  // Keep even unmatched/legacy charges visible for operator review. Ownership
  // comes from Stripe's object graph and our customer mapping, never metadata.
  const targets = subscriptionIds.length ? subscriptionIds : [null]
  for (const subscriptionId of targets) {
    await database.query(
      `insert into billing_private.payment_risk_reviews
      (stripe_event_id, risk_type, billing_account_id, stripe_subscription_id, stripe_charge_id,
       stripe_payment_intent_id, stripe_customer_id, amount, amount_refunded, currency, livemode, event_created_at)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      on conflict (stripe_event_id, stripe_subscription_id) do nothing`,
      [
        event.id,
        kind,
        account?.id ?? null,
        subscriptionId,
        charge.id,
        charge.payment_intent,
        charge.customer,
        charge.amount,
        charge.amount_refunded,
        charge.currency,
        event.livemode,
        new Date(event.created * 1000),
      ]
    )
  }
  if (account) {
    for (const subscriptionId of subscriptionIds) {
      await upsertStripeSubscription({ id: subscriptionId })
    }
  }
}

export { recordPaymentRisk }
