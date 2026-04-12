import type {
  ActiveOnboardingState,
  OnboardingStep,
} from "@/features/onboarding/types"
import { slugify } from "@/lib/slug"
import { createSupabaseServerClient } from "@/lib/supabase"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"

import { FREE_TRIAL_DAYS } from "@/features/onboarding/constants"
import { toIsoString } from "@/features/onboarding/utils/invite-utils"

async function getActiveOrganizationState(organizationId: string) {
  const supabase = createSupabaseServerClient()
  const now = new Date()

  const [
    onboardingResult,
    locationsResult,
    staffGroupsResult,
    locationsCountResult,
    zonesCountResult,
    inviteLinksResult,
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
      .order("is_default", { ascending: false })
      .order("name", { ascending: true }),
    supabase
      .from("locations")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("zones")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("staff_invite_links")
      .select("expires_at")
      .eq("organization_id", organizationId)
      .is("disabled_at", null),
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
    locationsCountResult.error,
    "We could not count your locations."
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
  const hasLocation = (locationsCountResult.count ?? 0) > 0
  const hasZone = (zonesCountResult.count ?? 0) > 0
  const hasInviteLink =
    (inviteLinksResult.data ?? []).filter((invite) => {
      return (
        invite.expires_at === null ||
        new Date(invite.expires_at).getTime() > now.getTime()
      )
    }).length > 0
  const lastStep: OnboardingStep =
    onboardingRow?.last_step === "location" ||
    onboardingRow?.last_step === "invite" ||
    onboardingRow?.last_step === "complete"
      ? onboardingRow.last_step
      : !hasLocation
        ? "location"
        : !hasInviteLink
          ? "invite"
          : "complete"

  const onboarding: ActiveOnboardingState = {
    organizationId,
    trialStartedAt: toIsoString(onboardingRow?.trial_started_at),
    trialEndsAt: toIsoString(onboardingRow?.trial_ends_at),
    completedAt: onboardingRow?.completed_at
      ? toIsoString(onboardingRow.completed_at)
      : hasLocation && hasZone && hasInviteLink
        ? toIsoString(new Date())
        : null,
    lastStep,
    hasLocation,
    hasZone,
    hasInviteLink,
  }

  return {
    onboarding,
    locations: locationsResult.data ?? [],
    staffGroups: (staffGroupsResult.data ?? []).map((staffGroup) => ({
      id: staffGroup.id,
      name: staffGroup.name,
      slug: staffGroup.slug,
      isDefault: staffGroup.is_default,
    })),
  }
}

async function ensureDefaultStaffGroup(organizationId: string) {
  const supabase = createSupabaseServerClient()

  const { error } = await supabase.from("staff_groups").upsert(
    {
      organization_id: organizationId,
      name: "Employees",
      slug: "employees",
      is_default: true,
    },
    {
      onConflict: "organization_id,slug",
      ignoreDuplicates: true,
    }
  )

  assertSupabaseSuccess(error, "We could not create the default staff group.")
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

  const { error } = await supabase
    .from("organization_onboarding_states")
    .upsert(
      {
        organization_id: organizationId,
        trial_started_at: existingRow?.trial_started_at ?? now.toISOString(),
        trial_ends_at:
          values.trialEndsAt?.toISOString() ??
          existingRow?.trial_ends_at ??
          defaultTrialEndsAt.toISOString(),
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
}

async function createUniqueLocationSlug(organizationId: string, name: string) {
  const supabase = createSupabaseServerClient()
  const baseSlug = slugify(name) || "location"
  let nextSlug = baseSlug
  let counter = 2

  for (;;) {
    const { data, error } = await supabase
      .from("locations")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("slug", nextSlug)
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
