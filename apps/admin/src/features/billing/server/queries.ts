import "@tanstack/react-start/server-only"

import { queryMany } from "@rocketrota/db"

import type { BillingLocation, BillingPageData } from "@/features/billing/types"

type BillingLocationRow = {
  billing_status: string | null
  location_id: string
  location_name: string
  organization_name: string | null
  trial_ends_at: Date | string
}

async function listBillingLocations(): Promise<BillingPageData> {
  const rows = await queryMany<BillingLocationRow>(
    `select location.id as location_id,
            location.name as location_name,
            organization_row.name as organization_name,
            billing_account.status as billing_status,
            entitlement.trial_ends_at
     from public.locations location
     join billing_private.location_entitlements entitlement
       on entitlement.location_id = location.id
     left join public."organization" organization_row
       on organization_row.id = location.organization_id
     left join public.billing_accounts billing_account
       on billing_account.id = location.billing_account_id
     order by entitlement.trial_ends_at asc
     limit 250`,
  )

  return {
    locations: rows.map(mapBillingLocation),
  }
}

function mapBillingLocation(row: BillingLocationRow): BillingLocation {
  return {
    billingStatus: row.billing_status,
    locationId: row.location_id,
    locationName: row.location_name,
    organizationName: row.organization_name,
    trialEndsAt: new Date(row.trial_ends_at).toISOString(),
  }
}

export { listBillingLocations }
