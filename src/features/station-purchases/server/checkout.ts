import "@tanstack/react-start/server-only"
import { getPurchaseEligibility, getStationPrice } from "./queries"
import { reserveStationOrder } from "./orders"
import type { StartStationPurchaseInput } from "../schemas"
import { getStripe } from "@/features/billing/server/stripe"
import { buildAppUrl } from "@/features/billing/server/urls"
import { getDatabase } from "@/lib/db"

async function createStationCheckout(
  input: StartStationPurchaseInput,
  userId: string
): Promise<{ checkoutUrl: string }> {
  const reason = await getPurchaseEligibility(input.locationId)
  if (reason) throw new Error(reason)
  const price = await getStationPrice()
  if (!price?.unit_amount)
    throw new Error("Extra station checkout has not been enabled yet.")
  const order = await reserveStationOrder(input, userId, {
    id: price.id,
    unit_amount: price.unit_amount,
  })
  const stripe = getStripe()
  // The stored order is immutable: retries use exactly the same Stripe parameters.
  const session = order.stripe_checkout_session_id
    ? await stripe.checkout.sessions.retrieve(order.stripe_checkout_session_id)
    : await stripe.checkout.sessions.create(
        {
          mode: "payment",
          customer: order.stripe_customer_id,
          client_reference_id: order.id,
          line_items: [{ price: order.stripe_price_id, quantity: 1 }],
          allow_promotion_codes: false,
          metadata: {
            purpose: "extra_clock_station",
            purchaseId: order.id,
            locationId: order.location_id,
            billingAccountId: order.billing_account_id,
          },
          success_url: buildAppUrl(order.return_path),
          cancel_url: buildAppUrl(order.return_path),
        },
        { idempotencyKey: `station-purchase/${order.id}` }
      )
  await getDatabase().query(
    `update billing_private.clock_station_purchases set stripe_checkout_session_id = $2, updated_at = now()
     where id = $1 and (stripe_checkout_session_id is null or stripe_checkout_session_id = $2)`,
    [order.id, session.id]
  )
  if (session.status !== "open" || !session.url)
    throw new Error("This checkout has ended. Refresh to start a new purchase.")
  return { checkoutUrl: session.url }
}
export { createStationCheckout }
