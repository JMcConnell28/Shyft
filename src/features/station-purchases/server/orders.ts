import "@tanstack/react-start/server-only"
import type { StartStationPurchaseInput } from "../schemas"
import { getDatabase } from "@/lib/db"

type StationOrder = {
  id: string
  location_id: string
  billing_account_id: string
  stripe_customer_id: string
  stripe_price_id: string
  stripe_checkout_session_id: string | null
  unit_amount: number
  currency: string
  return_path: string
  created_at: Date
  payment_status: string
}

async function reserveStationOrder(
  input: StartStationPurchaseInput,
  userId: string,
  price: { id: string; unit_amount: number }
) {
  const db = getDatabase()
  const account = await db.query<{
    id: string
    stripe_customer_id: string | null
  }>(
    `select a.id, a.stripe_customer_id from public.locations l
     join public.billing_accounts a on a.id = l.billing_account_id where l.id = $1`,
    [input.locationId]
  )
  const billing = account.rows.at(0)
  if (!billing?.stripe_customer_id)
    throw new Error("Set up your subscription before ordering a station.")
  const a = input.deliveryAddress
  await db.query(
    `insert into billing_private.clock_station_purchases
       (id, location_id, billing_account_id, created_by_user_id, stripe_customer_id, stripe_price_id, unit_amount, currency,
        return_path, delivery_name, delivery_line1, delivery_line2, delivery_city, delivery_county, delivery_postcode, delivery_country)
     values ($1,$2,$3,$4,$5,$6,$7,'gbp',$8,$9,$10,$11,$12,$13,$14,$15) on conflict (id) do nothing`,
    [
      input.purchaseId,
      input.locationId,
      billing.id,
      userId,
      billing.stripe_customer_id,
      price.id,
      price.unit_amount,
      input.returnPath,
      a.name,
      a.line1,
      a.line2 ?? null,
      a.city,
      a.county ?? null,
      a.postcode,
      a.country,
    ]
  )
  const result = await db.query<StationOrder>(
    `select * from billing_private.clock_station_purchases where id = $1 and location_id = $2 and billing_account_id = $3 and created_by_user_id = $4
      and (delivery_name, delivery_line1, delivery_line2, delivery_city, delivery_county, delivery_postcode, delivery_country, return_path)
        is not distinct from ($5::text,$6::text,$7::text,$8::text,$9::text,$10::text,$11::text,$12::text)`,
    [
      input.purchaseId,
      input.locationId,
      billing.id,
      userId,
      a.name,
      a.line1,
      a.line2 ?? null,
      a.city,
      a.county ?? null,
      a.postcode,
      a.country,
      input.returnPath,
    ]
  )
  const order = result.rows.at(0)
  if (!order || order.payment_status !== "awaiting_payment")
    throw new Error(
      "This order cannot be reused. Refresh to start a new purchase."
    )
  if (
    !order.stripe_checkout_session_id &&
    Date.now() - order.created_at.getTime() > 23 * 60 * 60 * 1000
  )
    throw new Error("This order has expired. Refresh to start a new purchase.")
  return order
}

export { reserveStationOrder }
export type { StationOrder }
