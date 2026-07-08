import "@tanstack/react-start/server-only"

import { getStripe } from "@/features/billing/server/stripe"
import {
  buildAppUrl,
  getSafeAppReturnPath,
} from "@/features/billing/server/urls"
import { getOptionalEnv } from "@/lib/env.server"

async function createBillingPortalSession(input: {
  stripeCustomerId: string
  returnPath?: string
}) {
  const session = await getStripe().billingPortal.sessions.create({
    customer: input.stripeCustomerId,
    ...(getOptionalEnv("STRIPE_BILLING_PORTAL_CONFIGURATION_ID")
      ? {
          configuration: getOptionalEnv(
            "STRIPE_BILLING_PORTAL_CONFIGURATION_ID"
          ),
        }
      : {}),
    return_url: buildAppUrl(
      getSafeAppReturnPath(input.returnPath, "/dashboard")
    ),
  })

  return {
    portalUrl: session.url,
  }
}

export { createBillingPortalSession }
