import "@tanstack/react-start/server-only"

import type { WorkspaceTrial } from "@/features/billing/types"
import { getDatabase } from "@/lib/db"

type WorkspaceTrialRow = {
  scope: "organization" | "location"
  organization_id: string | null
  location_id: string | null
  trial_started_at: Date | string
  trial_ends_at: Date | string
}

function mapWorkspaceTrial(row: WorkspaceTrialRow): WorkspaceTrial {
  const trialEndsAt = new Date(row.trial_ends_at)

  return {
    scope: row.scope,
    organizationId: row.organization_id,
    locationId: row.location_id,
    status: trialEndsAt.getTime() > Date.now() ? "trialing" : "expired",
    trialStartedAt: new Date(row.trial_started_at).toISOString(),
    trialEndsAt: trialEndsAt.toISOString(),
  }
}

async function ensureWorkspaceTrial(input: {
  organizationId?: string | null
  locationId?: string | null
}) {
  const result = input.locationId
    ? await getDatabase().query<WorkspaceTrialRow>(
        `select
           'location'::text as scope,
           location.organization_id,
           entitlement.location_id,
           entitlement.trial_started_at,
           entitlement.trial_ends_at
         from billing_private.location_entitlements entitlement
         join public.locations location on location.id = entitlement.location_id
         where entitlement.location_id = $1`,
        [input.locationId]
      )
    : input.organizationId
      ? await ensureOrganizationWorkspaceTrial(input.organizationId)
      : null
  const trial = result?.rows.at(0)

  if (!trial?.trial_started_at || !trial.trial_ends_at) {
    throw new Error("We could not load the workspace trial.")
  }

  return mapWorkspaceTrial(trial)
}

async function ensureOrganizationWorkspaceTrial(organizationId: string) {
  return getDatabase().query<WorkspaceTrialRow>(
    `with trial_source as (
       select
         organization_row."id" as organization_id,
         coalesce(
           existing_trial.trial_started_at,
           onboarding_state.trial_started_at,
           organization_row."createdAt",
           timezone('utc', now())
         ) as trial_started_at,
         coalesce(
           existing_trial.trial_ends_at,
           onboarding_state.trial_ends_at,
           organization_row."createdAt" + interval '14 days',
           timezone('utc', now()) + interval '14 days'
         ) as trial_ends_at
       from public."organization" organization_row
       left join public.workspace_trials existing_trial
         on existing_trial.organization_id = organization_row."id"
       left join public.organization_onboarding_states onboarding_state
         on onboarding_state.organization_id = organization_row."id"
       where organization_row."id" = $1
       limit 1
     ),
     ensured_trial as (
       insert into public.workspace_trials (
         scope,
         organization_id,
         status,
         trial_started_at,
         trial_ends_at
       )
       select
         'organization',
         trial_source.organization_id,
         case
           when trial_source.trial_ends_at <= timezone('utc', now()) then 'expired'
           else 'trialing'
         end,
         trial_source.trial_started_at,
         trial_source.trial_ends_at
       from trial_source
       on conflict (organization_id)
       where organization_id is not null
       do update set updated_at = public.workspace_trials.updated_at
       returning
         scope,
         organization_id,
         location_id,
         trial_started_at,
         trial_ends_at
     )
     select
       'organization'::text as scope,
       ensured_trial.organization_id,
       null::uuid as location_id,
       coalesce(min(entitlement.trial_started_at), ensured_trial.trial_started_at) as trial_started_at,
       coalesce(min(entitlement.trial_ends_at), ensured_trial.trial_ends_at) as trial_ends_at
     from ensured_trial
     left join public.locations location
       on location.organization_id = ensured_trial.organization_id
     left join billing_private.location_entitlements entitlement
       on entitlement.location_id = location.id
     group by ensured_trial.organization_id,
              ensured_trial.trial_started_at,
              ensured_trial.trial_ends_at`,
    [organizationId]
  )
}

export { ensureWorkspaceTrial }
