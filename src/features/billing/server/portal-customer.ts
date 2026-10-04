import "@tanstack/react-start/server-only"

import { getDatabase } from "@/lib/db"

async function getBillingPortalCustomer(input: {
  organizationId?: string
  locationId?: string
}): Promise<string> {
  const result = await getDatabase().query<{
    stripe_customer_id: string | null
  }>(
    input.organizationId
      ? `select stripe_customer_id from public.billing_accounts
         where scope = 'organization' and organization_id = $1 limit 1`
      : `select account.stripe_customer_id from public.locations location
         join public.billing_accounts account on account.id = location.billing_account_id
         where location.id = $1 limit 1`,
    [input.organizationId ?? input.locationId]
  )
  const customerId = result.rows.at(0)?.stripe_customer_id
  if (!customerId) {
    throw new Error("No Stripe customer exists for this workspace yet.")
  }
  return customerId
}

export { getBillingPortalCustomer }
