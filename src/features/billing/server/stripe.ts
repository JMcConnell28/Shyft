import "@tanstack/react-start/server-only"

import Stripe from "stripe"

import { getAppBaseUrl } from "@/lib/app-url.server"
import { getOptionalEnv, getRequiredEnv } from "@/lib/env.server"

const stripeApiVersion = "2025-11-17.clover"

const globalForStripe = globalThis as typeof globalThis & {
  shyftStripeClient?: Stripe
}

function getStripe() {
  if (!globalForStripe.shyftStripeClient) {
    globalForStripe.shyftStripeClient = new Stripe(
      getRequiredEnv("STRIPE_SECRET_KEY"),
      {
        apiVersion: stripeApiVersion,
        appInfo: {
          name: "RocketRota",
        },
      },
    )
  }

  return globalForStripe.shyftStripeClient
}

function getLocationPriceId() {
  return getRequiredEnv("STRIPE_LOCATION_PRICE_ID")
}

function getExtraEmployeePriceId() {
  return getRequiredEnv("STRIPE_EXTRA_EMPLOYEE_PRICE_ID")
}

function getBillingCurrency() {
  return getOptionalEnv("STRIPE_BILLING_CURRENCY") ?? "gbp"
}

export {
  getAppBaseUrl,
  getBillingCurrency,
  getExtraEmployeePriceId,
  getLocationPriceId,
  getStripe,
  stripeApiVersion,
}
