import { FREE_TRIAL_DAYS } from "@/features/onboarding/constants"
import { getDatabase } from "@/lib/db"
import type { WorkspaceTrial } from "@/features/billing/types"

type WorkspaceTrialRow = {
  scope: "organization" | "location"
  organization_id: string | null
  location_id: string | null
  status: "trialing" | "active" | "expired" | "canceled"
  trial_started_at: Date | string
  trial_ends_at: Date | string
}

function toIsoString(value: Date | string) {
  return new Date(value).toISOString()
}

function mapWorkspaceTrial(row: WorkspaceTrialRow): WorkspaceTrial {
  return {
    scope: row.scope,
    organizationId: row.organization_id,
    locationId: row.location_id,
    status: row.status,
    trialStartedAt: toIsoString(row.trial_started_at),
    trialEndsAt: toIsoString(row.trial_ends_at),
  }
}

async function ensureWorkspaceTrial(input: {
  organizationId?: string | null
  locationId?: string | null
}) {
  const database = getDatabase()
  const now = new Date()
  const trialEndsAt = new Date(now)
  trialEndsAt.setDate(trialEndsAt.getDate() + FREE_TRIAL_DAYS)

  if (input.organizationId) {
    const result = await database.query<WorkspaceTrialRow>(
      `insert into public.workspace_trials (
         scope,
         organization_id,
         status,
         trial_started_at,
         trial_ends_at
       ) values ('organization', $1, 'trialing', $2, $3)
       on conflict (organization_id)
       where organization_id is not null
       do update set status = case
                              when public.workspace_trials.status = 'trialing'
                               and public.workspace_trials.trial_ends_at <= timezone('utc', now())
                              then 'expired'
                              else public.workspace_trials.status
                            end,
                     updated_at = timezone('utc', now())
       returning scope,
                 organization_id,
                 location_id,
                 status,
                 trial_started_at,
                 trial_ends_at`,
      [input.organizationId, now, trialEndsAt],
    )

    const trial = result.rows[0]

    if (!trial) {
      throw new Error("We could not load the workspace trial.")
    }

    return mapWorkspaceTrial(trial)
  }

  if (!input.locationId) {
    throw new Error("Choose a workspace.")
  }

  const result = await database.query<WorkspaceTrialRow>(
    `insert into public.workspace_trials (
       scope,
       location_id,
       status,
       trial_started_at,
       trial_ends_at
     ) values ('location', $1, 'trialing', $2, $3)
     on conflict (location_id)
     where location_id is not null
     do update set status = case
                            when public.workspace_trials.status = 'trialing'
                             and public.workspace_trials.trial_ends_at <= timezone('utc', now())
                            then 'expired'
                            else public.workspace_trials.status
                          end,
                   updated_at = timezone('utc', now())
     returning scope,
               organization_id,
               location_id,
               status,
               trial_started_at,
               trial_ends_at`,
    [input.locationId, now, trialEndsAt],
  )

  const trial = result.rows[0]

  if (!trial) {
    throw new Error("We could not load the workspace trial.")
  }

  return mapWorkspaceTrial(trial)
}

async function setWorkspaceTrialForDevelopment(input: {
  organizationId?: string | null
  locationId?: string | null
  state: "active" | "ending-soon" | "expired" | "reset"
}) {
  const now = new Date()
  const trialEndsAt = new Date(now)

  if (input.state === "expired") {
    trialEndsAt.setDate(trialEndsAt.getDate() - 1)
  } else if (input.state === "ending-soon") {
    trialEndsAt.setDate(trialEndsAt.getDate() + 2)
  } else {
    trialEndsAt.setDate(trialEndsAt.getDate() + FREE_TRIAL_DAYS)
  }

  const status = input.state === "expired" ? "expired" : "trialing"

  await ensureWorkspaceTrial(input)

  const result = await getDatabase().query<WorkspaceTrialRow>(
    `update public.workspace_trials
     set status = $3,
         trial_started_at = case when $4::boolean then $5 else trial_started_at end,
         trial_ends_at = $6,
         updated_at = timezone('utc', now())
     where (($1::text is null and organization_id is null) or organization_id = $1::text)
       and (($2::uuid is null and location_id is null) or location_id = $2::uuid)
     returning scope,
               organization_id,
               location_id,
               status,
               trial_started_at,
               trial_ends_at`,
    [
      input.organizationId ?? null,
      input.locationId ?? null,
      status,
      input.state === "reset",
      now,
      trialEndsAt,
    ],
  )

  const trial = result.rows[0]

  if (!trial) {
    throw new Error("We could not update the workspace trial.")
  }

  return mapWorkspaceTrial(trial)
}

export { ensureWorkspaceTrial, setWorkspaceTrialForDevelopment }
