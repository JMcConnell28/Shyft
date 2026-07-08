import "@tanstack/react-start/server-only"

import Stripe from "stripe"

import { getAppBaseUrl } from "@/lib/app-url.server"
import { getOptionalEnv, getRequiredEnv } from "@/lib/env.server"

const stripeApiVersion = "2026-02-25.clover"

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
      }
    )
  }

  return globalForStripe.shyftStripeClient
}

function getCoreBasePriceId() {
  return getRequiredEnv("STRIPE_CORE_BASE_PRICE_ID")
}

function getCoreExtraEmployeePriceId() {
  return getRequiredEnv("STRIPE_CORE_EXTRA_EMPLOYEE_PRICE_ID")
}

function getOptionalCoreExtraEmployeePriceId() {
  return getOptionalEnv("STRIPE_CORE_EXTRA_EMPLOYEE_PRICE_ID")
}

function getTimeAttendanceEmployeePriceId() {
  return getRequiredEnv("STRIPE_TIME_ATTENDANCE_EMPLOYEE_PRICE_ID")
}

function getOptionalTimeAttendanceEmployeePriceId() {
  return getOptionalEnv("STRIPE_TIME_ATTENDANCE_EMPLOYEE_PRICE_ID")
}

function getBillingCurrency() {
  return getOptionalEnv("STRIPE_BILLING_CURRENCY") ?? "gbp"
}

export {
  getAppBaseUrl,
  getBillingCurrency,
  getCoreBasePriceId,
  getCoreExtraEmployeePriceId,
  getOptionalCoreExtraEmployeePriceId,
  getOptionalTimeAttendanceEmployeePriceId,
  getStripe,
  getTimeAttendanceEmployeePriceId,
  stripeApiVersion,
}
