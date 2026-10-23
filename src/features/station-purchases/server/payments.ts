import "@tanstack/react-start/server-only"
import type Stripe from "stripe"
import type { StationOrder } from "./orders"
import type { StationCheckout, StationLineItem } from "./payment-types"
import { getDatabase } from "@/lib/db"
import { getStripe } from "@/features/billing/server/stripe"

function matchesStationPayment(
  order: StationOrder,
  session: StationCheckout,
  items: Array<StationLineItem>
): boolean {
  const item = items.at(0)
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id
  return (
    session.mode === "payment" &&
    session.metadata?.purpose === "extra_clock_station" &&
    session.metadata.purchaseId === order.id &&
    session.metadata.locationId === order.location_id &&
    session.metadata.billingAccountId === order.billing_account_id &&
    session.client_reference_id === order.id &&
    session.id === order.stripe_checkout_session_id &&
    customerId === order.stripe_customer_id &&
    session.currency === order.currency &&
    session.amount_total === order.unit_amount &&
    items.length === 1 &&
    item?.price?.id === order.stripe_price_id &&
    item.quantity === 1 &&
    item.amount_total === order.unit_amount
  )
}

async function syncStationCheckout(
  session: StationCheckout,
  failed = false
): Promise<void> {
  if (session.metadata?.purpose !== "extra_clock_station") return
  const db = getDatabase()
  // A verified event may arrive before the create response is stored. Validate
  // every immutable order field before binding a session in that case.
  const result = await db.query<StationOrder>(
    `select * from billing_private.clock_station_purchases where stripe_checkout_session_id = $1 or (stripe_checkout_session_id is null and id::text = $2)`,
    [session.id, session.metadata.purchaseId]
  )
  const order = result.rows.at(0)
  if (!order)
    throw new Error(
      "Station checkout has not been linked to its order yet. Retry webhook."
    )
  const items = await getStripe().checkout.sessions.listLineItems(session.id, {
    limit: 2,
  })
  if (
    !matchesStationPayment(
      {
        ...order,
        stripe_checkout_session_id:
          order.stripe_checkout_session_id ?? session.id,
      },
      session,
      items.data
    )
  )
    throw new Error("Station payment does not match the order.")
  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id
  const linked = await db.query(
    `update billing_private.clock_station_purchases set stripe_checkout_session_id = $2,
    stripe_payment_intent_id = coalesce(stripe_payment_intent_id, $3)
    where id = $1 and (stripe_checkout_session_id is null or stripe_checkout_session_id = $2) returning id`,
    [order.id, session.id, paymentIntent ?? null]
  )
  if (!linked.rows.length)
    throw new Error("A different checkout is already linked to this station.")
  if (session.payment_status === "paid") {
    if (!paymentIntent)
      throw new Error("Paid station checkout has no payment intent.")
    const intent = await getStripe().paymentIntents.retrieve(paymentIntent, {
      expand: ["latest_charge"],
    })
    const charge =
      typeof intent.latest_charge === "object" ? intent.latest_charge : null
    const hold = charge?.disputed
      ? "disputed"
      : charge && charge.amount_refunded > 0
        ? "refunded"
        : null
    if (
      intent.status !== "succeeded" ||
      intent.amount_received !== order.unit_amount ||
      intent.currency !== order.currency
    )
      throw new Error("Station payment has not settled correctly.")
    await db.query(
      `update billing_private.clock_station_purchases set payment_status = $4, paid_at = coalesce(paid_at, now()),
       stripe_payment_intent_id = $2, is_live = $3, updated_at = now()
       where id = $1 and payment_status in ('awaiting_payment','failed','expired')`,
      [order.id, paymentIntent, session.livemode, hold ?? "paid"]
    )
  } else if (failed || session.status === "expired") {
    await db.query(
      `update billing_private.clock_station_purchases set payment_status = $2, updated_at = now() where id = $1 and payment_status = 'awaiting_payment'`,
      [order.id, failed ? "failed" : "expired"]
    )
  }
}

async function reconcileStationCheckouts(): Promise<void> {
  const { rows } = await getDatabase().query<{
    stripe_checkout_session_id: string
  }>(
    `select stripe_checkout_session_id from billing_private.clock_station_purchases where payment_status = 'awaiting_payment'
     and stripe_checkout_session_id is not null order by updated_at limit 50`
  )
  for (const row of rows) {
    try {
      await syncStationCheckout(
        await getStripe().checkout.sessions.retrieve(
          row.stripe_checkout_session_id
        )
      )
    } catch (error) {
      console.error("Station checkout recovery failed", error)
    }
    await getDatabase().query(
      `update billing_private.clock_station_purchases set updated_at = now() where stripe_checkout_session_id = $1`,
      [row.stripe_checkout_session_id]
    )
  }
}
async function holdRefundedStation(
  intent: string | Stripe.PaymentIntent | null,
  status: "refunded" | "disputed"
): Promise<void> {
  const id = typeof intent === "string" ? intent : intent?.id
  if (!id) return
  await getDatabase().query(
    `update billing_private.clock_station_purchases set payment_status = $2, updated_at = now() where stripe_payment_intent_id = $1`,
    [id, status]
  )
}
export {
  holdRefundedStation,
  syncStationCheckout,
  reconcileStationCheckouts,
  matchesStationPayment,
}
