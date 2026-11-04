import "@tanstack/react-start/server-only"
import type Stripe from "stripe"

import { acquireBillingProcessingLock } from "@/features/billing/server/processing-locks"
import { getStripe } from "@/features/billing/server/stripe"

async function syncCurrentStripeSubscription(
  id: string,
  persist: (subscription: Stripe.Subscription) => Promise<void>
): Promise<Stripe.Subscription> {
  const lock = await acquireBillingProcessingLock("subscription", id)
  if (!lock)
    throw new Error(
      "Subscription synchronization is already running. Please retry."
    )
  try {
    // Retrieve after taking the shared lock; signed event age does not establish
    // which subscription state is current, including across reconcilers.
    const current = await getStripe().subscriptions.retrieve(
      id,
      { expand: ["items.data.price"] },
      { timeout: 15000, maxNetworkRetries: 1 }
    )
    lock.assertHeld()
    await persist(current)
    return current
  } finally {
    await lock.release()
  }
}

export { syncCurrentStripeSubscription }
