import type Stripe from "stripe"

type StationCheckout = Pick<
  Stripe.Checkout.Session,
  | "id"
  | "mode"
  | "metadata"
  | "client_reference_id"
  | "customer"
  | "currency"
  | "amount_total"
  | "payment_status"
  | "payment_intent"
  | "livemode"
  | "status"
>
type StationLineItem = {
  price: { id: string } | null
  quantity: number | null
  amount_total: number
}

export type { StationCheckout, StationLineItem }
