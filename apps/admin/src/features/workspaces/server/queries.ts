import "@tanstack/react-start/server-only"

import { queryMany } from "@rocketrota/db"

import type { WorkspacesPageData, WorkspaceSummary } from "@/features/workspaces/types"

type WorkspaceRow = {
  active_employees: string | number
  billing_status: string | null
  location_id: string
  location_name: string
  organization_id: string | null
  organization_name: string | null
  trial_ends_at: Date | string | null
}

async function listWorkspaces(): Promise<WorkspacesPageData> {
  const rows = await queryMany<WorkspaceRow>(
    `select location.id as location_id,
            location.name as location_name,
            organization_row.id as organization_id,
            organization_row.name as organization_name,
            billing_account.status as billing_status,
            entitlement.trial_ends_at,
            count(employee.id) filter (where employee.status = 'active') as active_employees
     from public.locations location
     left join public."organization" organization_row
       on organization_row.id = location.organization_id
     left join public.billing_accounts billing_account
       on billing_account.id = location.billing_account_id
     left join billing_private.location_entitlements entitlement
       on entitlement.location_id = location.id
     left join public.employees employee
       on employee.location_id = location.id
       or employee.organization_id = location.organization_id
     group by location.id,
              location.name,
              organization_row.id,
              organization_row.name,
              billing_account.status,
              entitlement.trial_ends_at
     order by organization_row.name nulls last, location.name
     limit 250`,
  )

  return {
    workspaces: rows.map(mapWorkspace),
  }
}

function mapWorkspace(row: WorkspaceRow): WorkspaceSummary {
  return {
    activeEmployees: Number(row.active_employees),
    billingStatus: row.billing_status,
    locationId: row.location_id,
    locationName: row.location_name,
    organizationId: row.organization_id,
    organizationName: row.organization_name,
    trialEndsAt: row.trial_ends_at
      ? new Date(row.trial_ends_at).toISOString()
      : null,
  }
}

export { listWorkspaces }
