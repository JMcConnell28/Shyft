import "@tanstack/react-start/server-only"

import type { OrganizationBillingLocationSummary } from "@/features/billing/types"
import { getDatabase } from "@/lib/db"

type OverviewRow = {
  location_id: string
  location_name: string
  billing_account_id: string
  billing_scope: "location" | "organization"
  current_period_end: Date | string | null
  access_state: OrganizationBillingLocationSummary["accessState"]
  used_employee_count: number | string
  addon_status: OrganizationBillingLocationSummary["timeAttendanceStatus"]
  transfer_id: string | null
  source_billing_account_id: string | null
  target_billing_account_id: string | null
  transfer_status:
    | "scheduled"
    | "ready"
    | "completed"
    | "failed"
    | "canceled"
    | null
  transfer_effective_at: Date | string | null
}

async function getOrganizationBillingOverview(organizationId: string) {
  const result = await getDatabase().query<OverviewRow>(
    `select
       location.id as location_id,
       location.name as location_name,
       account.id as billing_account_id,
       account.scope as billing_scope,
       subscription.current_period_end,
       case
         when subscription.status in ('active', 'trialing') then 'active'
         when subscription.status = 'past_due'
          and subscription.past_due_started_at + interval '5 days' > timezone('utc', now()) then 'grace'
         when entitlement.trial_ends_at > timezone('utc', now()) then 'trial'
         else 'recovery'
       end as access_state,
       coalesce(employee_counts.used_employee_count, 0) as used_employee_count,
       addon.status as addon_status,
       transfer.id as transfer_id,
       transfer.source_billing_account_id,
       transfer.target_billing_account_id,
       transfer.status as transfer_status,
       transfer.effective_at as transfer_effective_at
     from public.locations location
     join public.billing_accounts account on account.id = location.billing_account_id
     join billing_private.location_entitlements entitlement on entitlement.location_id = location.id
     left join lateral (
       select status, current_period_end, past_due_started_at
       from public.billing_subscriptions
       where billing_account_id = account.id
       order by created_at desc
       limit 1
     ) subscription on true
     left join lateral (
       select count(distinct usage.employee_id)::integer as used_employee_count
       from billing_private.organization_billing_periods period
       join billing_private.organization_employee_usage_events usage
         on usage.organization_billing_period_id = period.id
        and usage.location_id = location.id
       where period.billing_account_id = account.id
         and period.period_start <= timezone('utc', now())
         and timezone('utc', now()) < period.period_end
     ) employee_counts on true
     left join billing_private.location_addons addon
       on addon.location_id = location.id and addon.addon_type = 'time_attendance'
     left join lateral (
       select * from billing_private.billing_transfers
       where location_id = location.id and status in ('scheduled', 'ready')
       order by created_at desc limit 1
     ) transfer on true
     where location.organization_id = $1
     order by location.name`,
    [organizationId]
  )

  return result.rows.map((row): OrganizationBillingLocationSummary => {
    const usedEmployeeCount = Number(row.used_employee_count)
    const transfer =
      row.transfer_id &&
      row.source_billing_account_id &&
      row.target_billing_account_id &&
      row.transfer_status &&
      row.transfer_effective_at
        ? {
            id: row.transfer_id,
            sourceBillingAccountId: row.source_billing_account_id,
            targetBillingAccountId: row.target_billing_account_id,
            status: row.transfer_status,
            effectiveAt: new Date(row.transfer_effective_at).toISOString(),
          }
        : null

    return {
      locationId: row.location_id,
      locationName: row.location_name,
      billingAccountId: row.billing_account_id,
      payerLabel: "Organisation billing",
      renewalDate: row.current_period_end
        ? new Date(row.current_period_end).toISOString()
        : null,
      accessState: row.access_state,
      usedEmployeeCount,
      includedEmployeeCount: 0,
      extraEmployeeCount: 0,
      timeAttendanceStatus: row.addon_status,
      transfer,
    }
  })
}

export { getOrganizationBillingOverview }
