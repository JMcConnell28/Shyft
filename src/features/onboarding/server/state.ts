import type {
  ActiveOnboardingState,
  OnboardingStep,
} from "@/features/onboarding/types"
import { getDatabase } from "@/lib/db"
import { slugify } from "@/lib/slug"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"

import { FREE_TRIAL_DAYS } from "@/features/onboarding/constants"
import { getWorkspaceTrial } from "@/features/billing/server/trials"
import {
  ensureEmployeeStaffGroup,
  isEmployeeStaffGroup,
} from "@/features/staff-groups/server/shared"
import { toIsoString } from "@/features/onboarding/utils/invite-utils"

async function getActiveOrganizationState(organizationId: string) {
  const supabase = createSupabaseServerClient()
  const now = new Date()

  const [
    onboardingResult,
    locationsResult,
    staffGroupsResult,
    zonesCountResult,
    inviteLinksResult,
    trial,
  ] = await Promise.all([
    supabase
      .from("organization_onboarding_states")
      .select("trial_started_at, trial_ends_at, completed_at, last_step")
      .eq("organization_id", organizationId)
      .maybeSingle(),
    supabase
      .from("locations")
      .select("id, name, slug")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true }),
    supabase
      .from("staff_groups")
      .select("id, name, slug, is_default")
      .eq("organization_id", organizationId)
      .order("name", { ascending: true }),
    supabase
      .from("zones")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .is("deleted_at", null),
    supabase
      .from("staff_invite_links")
      .select("expires_at")
      .eq("organization_id", organizationId)
      .is("disabled_at", null)
      .or(`expires_at.is.null,expires_at.gt.${now.toISOString()}`)
      .limit(1),
    getWorkspaceTrial({ organizationId }),
  ])

  assertSupabaseSuccess(
    onboardingResult.error,
    "We could not load the onboarding state."
  )
  assertSupabaseSuccess(
    locationsResult.error,
    "We could not load your locations."
  )
  assertSupabaseSuccess(
    staffGroupsResult.error,
    "We could not load your staff groups."
  )
  assertSupabaseSuccess(
    zonesCountResult.error,
    "We could not count your zones."
  )
  assertSupabaseSuccess(
    inviteLinksResult.error,
    "We could not load your invite links."
  )

  const onboardingRow = onboardingResult.data
  const hasLocation = (locationsResult.data?.length ?? 0) > 0
  const hasZone = (zonesCountResult.count ?? 0) > 0
  const hasInviteLink = (inviteLinksResult.data?.length ?? 0) > 0
  const lastStep: OnboardingStep =
    onboardingRow?.last_step === "location" ||
    onboardingRow?.last_step === "invite" ||
    onboardingRow?.last_step === "complete"
      ? onboardingRow.last_step
      : !hasLocation
        ? "location"
        : "complete"

  const onboarding: ActiveOnboardingState = {
    organizationId,
    trialStartedAt: trial.trialStartedAt,
    trialEndsAt: trial.trialEndsAt,
    completedAt: onboardingRow?.completed_at
      ? toIsoString(onboardingRow.completed_at)
      : hasLocation
        ? toIsoString(new Date())
        : null,
    lastStep,
    hasLocation,
    hasZone,
    hasInviteLink,
  }

  return {
    onboarding,
    trial,
    locations: locationsResult.data ?? [],
    staffGroups: (staffGroupsResult.data ?? [])
      .map((staffGroup) => ({
        id: staffGroup.id,
        name: staffGroup.name,
        slug: staffGroup.slug,
        isFallback: isEmployeeStaffGroup(staffGroup),
      }))
      .sort((left, right) => {
        if (left.isFallback === right.isFallback) {
          return left.name.localeCompare(right.name)
        }

        return left.isFallback ? -1 : 1
      }),
  }
}

async function ensureDefaultStaffGroup(organizationId: string) {
  await ensureEmployeeStaffGroup({
    organizationId,
    locationId: null,
  })
}

async function upsertOnboardingState(
  organizationId: string,
  values: {
    trialEndsAt?: Date
    lastStep?: OnboardingStep
    completedAt?: Date | null
  }
) {
  const supabase = createSupabaseServerClient()
  const { data: existingRow, error: existingError } = await supabase
    .from("organization_onboarding_states")
    .select("trial_started_at, trial_ends_at, last_step, completed_at")
    .eq("organization_id", organizationId)
    .maybeSingle()

  assertSupabaseSuccess(
    existingError,
    "We could not load the current onboarding state."
  )

  const now = new Date()
  const defaultTrialEndsAt = new Date(now)
  defaultTrialEndsAt.setDate(defaultTrialEndsAt.getDate() + FREE_TRIAL_DAYS)
  const trialStartedAt = existingRow?.trial_started_at ?? now.toISOString()
  const trialEndsAt =
    values.trialEndsAt?.toISOString() ??
    existingRow?.trial_ends_at ??
    defaultTrialEndsAt.toISOString()

  const { error } = await supabase
    .from("organization_onboarding_states")
    .upsert(
      {
        organization_id: organizationId,
        trial_started_at: trialStartedAt,
        trial_ends_at: trialEndsAt,
        last_step:
          values.lastStep ??
          (existingRow?.last_step as OnboardingStep | undefined) ??
          "location",
        completed_at:
          values.completedAt === undefined
            ? (existingRow?.completed_at ?? null)
            : (values.completedAt?.toISOString() ?? null),
        updated_at: now.toISOString(),
      },
      { onConflict: "organization_id" }
    )

  assertSupabaseSuccess(error, "We could not save the onboarding state.")

  await upsertOrganizationTrialState({
    organizationId,
    trialStartedAt,
    trialEndsAt,
  })
}

async function upsertOrganizationTrialState(input: {
  organizationId: string
  trialStartedAt: string
  trialEndsAt: string
}) {
  await getDatabase().query(
    `insert into public.workspace_trials (
       scope,
       organization_id,
       location_id,
       status,
       trial_started_at,
       trial_ends_at
     ) values (
       'organization',
       $1,
       null,
       case when $3::timestamptz <= timezone('utc', now()) then 'expired' else 'trialing' end,
       $2,
       $3
     )
     on conflict (organization_id)
     where organization_id is not null
     do update set status = case
                              when excluded.trial_ends_at <= timezone('utc', now()) then 'expired'
                              else 'trialing'
                            end,
                   trial_started_at = excluded.trial_started_at,
                   trial_ends_at = excluded.trial_ends_at,
                   updated_at = timezone('utc', now())`,
    [input.organizationId, input.trialStartedAt, input.trialEndsAt]
  )
}

async function createUniqueLocationSlug(
  organizationId: string,
  name: string
) {
  const supabase = createSupabaseServerClient()
  const baseSlug = slugify(name) || "location"
  let nextSlug = baseSlug
  let counter = 2

  for (;;) {
    const query = supabase.from("locations").select("id").eq("slug", nextSlug)

    const { data, error } = await query
      .eq("organization_id", organizationId)
      .maybeSingle()

    assertSupabaseSuccess(error, "We could not check location availability.")

    if (!data) {
      return nextSlug
    }

    nextSlug = `${baseSlug}-${counter}`
    counter += 1
  }
}

export {
  createUniqueLocationSlug,
  ensureDefaultStaffGroup,
  getActiveOrganizationState,
  upsertOnboardingState,
}
