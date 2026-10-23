import "@tanstack/react-start/server-only"
import type Stripe from "stripe"
import { getOptionalEnv } from "@/lib/env.server"
import { getStripe } from "@/features/billing/server/stripe"

let cachedPrice: {
  id: string
  expiresAt: number
  value: Promise<Stripe.Price>
} | null = null

async function getStationPrice(): Promise<Stripe.Price | null> {
  const id = getOptionalEnv("STRIPE_EXTRA_CLOCK_STATION_PRICE_ID")
  if (!id) return null
  if (
    !cachedPrice ||
    cachedPrice.id !== id ||
    cachedPrice.expiresAt <= Date.now()
  ) {
    cachedPrice = {
      id,
      expiresAt: Date.now() + 60000,
      value: readStationPrice(id),
    }
  }
  try {
    return await cachedPrice.value
  } catch (error) {
    cachedPrice = null
    throw error
  }
}

async function readStationPrice(id: string): Promise<Stripe.Price> {
  const price = await getStripe().prices.retrieve(id)
  if (
    !price.active ||
    price.type !== "one_time" ||
    price.currency !== "gbp" ||
    !price.unit_amount ||
    price.unit_amount <= 0
  ) {
    throw new Error(
      "The additional clock-in station price is not configured correctly."
    )
  }
  return price
}
export { getStationPrice }
