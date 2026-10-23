import "@tanstack/react-start/server-only"

import { getOptionalTimeAttendanceEmployeePriceId, getStripe } from "./stripe"
import type Stripe from "stripe"

import { getDatabase } from "@/lib/db"

// Persist payment evidence, rather than treating an active subscription or saved
// card as proof of payment. A zero-value trial invoice cannot release hardware.
async function recordStationPayment(
  invoice: Stripe.Invoice,
  subscription: Stripe.Subscription
): Promise<void> {
  const paidAt = invoice.status_transitions.paid_at
  if (
    !invoice.livemode ||
    invoice.status !== "paid" ||
    invoice.amount_paid <= 0 ||
    !paidAt
  )
    return

  const priceId = getOptionalTimeAttendanceEmployeePriceId()
  const includesTimeAttendance = Boolean(
    priceId && subscription.items.data.some((item) => item.price.id === priceId)
  )

  await getDatabase().query(
    `insert into billing_private.station_payment_receipts (
       stripe_invoice_id, billing_account_id, stripe_subscription_id,
       amount_paid, currency, invoice_created_at, paid_at, includes_time_attendance
     ) select $1, billing_account_id, stripe_subscription_id, $3, $4, $5, $6, $7
       from public.billing_subscriptions where stripe_subscription_id = $2
     on conflict (stripe_invoice_id) do nothing`,
    [
      invoice.id,
      subscription.id,
      invoice.amount_paid,
      invoice.currency,
      new Date(invoice.created * 1000),
      new Date(paidAt * 1000),
      includesTimeAttendance,
    ]
  )
}

// Existing paid customers are recovered by the regular billing reconciliation;
// historical webhook logs alone do not contain verifiable invoice amounts.
async function reconcileStationPayments(
  stripeCustomerId: string
): Promise<void> {
  const { rows } = await getDatabase().query<{ earliest: Date | null }>(
    `select min(greatest(h.claimed_at, a.billing_starts_at, e.trial_ends_at)) as earliest
     from billing_private.location_hardware_entitlements h
     join public.locations l on l.id = h.location_id
     join public.billing_accounts account on account.id = l.billing_account_id
     join billing_private.location_addons a on a.location_id = l.id and a.addon_type = 'time_attendance'
     join billing_private.location_entitlements e on e.location_id = l.id
     where account.stripe_customer_id = $1 and h.entitlement_status = 'claimed'
       and h.fulfillment_status not in ('shipped', 'delivered')`,
    [stripeCustomerId]
  )
  const earliest = rows.at(0)?.earliest
  if (!earliest || earliest.getTime() > Date.now()) return
  const stripe = getStripe()
  const subscriptions = new Map<string, Stripe.Subscription>()
  for await (const invoice of stripe.invoices.list({
    customer: stripeCustomerId,
    status: "paid",
    created: { gte: Math.floor(earliest.getTime() / 1000) - 1 },
    limit: 100,
  })) {
    const reference = invoice.parent?.subscription_details?.subscription
    if (!reference) continue
    const id = typeof reference === "string" ? reference : reference.id
    const subscription =
      subscriptions.get(id) ?? (await stripe.subscriptions.retrieve(id))
    // Old canceled subscriptions must not be reinserted as the newest local
    // subscription while recovering an account's historical invoices.
    if (subscription.status !== "active") {
      subscriptions.set(id, subscription)
      continue
    }
    if (!subscriptions.has(id)) {
      const { upsertStripeSubscription } = await import("./subscriptions")
      await upsertStripeSubscription(subscription)
    }
    subscriptions.set(id, subscription)
    await recordStationPayment(invoice, subscription)
  }
}

export { recordStationPayment, reconcileStationPayments }
