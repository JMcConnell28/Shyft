import "@tanstack/react-start/server-only"

import { getStripe } from "@/features/billing/server/stripe"
import { buildAppUrl, getSafeAppReturnPath } from "@/features/billing/server/urls"

async function createBillingPortalSession(input: {
  stripeCustomerId: string
  returnPath?: string
}) {
  const session = await getStripe().billingPortal.sessions.create({
    customer: input.stripeCustomerId,
    return_url: buildAppUrl(getSafeAppReturnPath(input.returnPath, "/dashboard")),
  })

  return {
    portalUrl: session.url,
  }
}

export { createBillingPortalSession }
