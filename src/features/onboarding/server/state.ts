import type {
  ActiveOnboardingState,
  OnboardingStep,
} from "@/features/onboarding/types"
import { getDatabase } from "@/lib/db"
import { slugify } from "@/lib/slug"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"

import { FREE_TRIAL_DAYS } from "@/features/onboarding/constants"
import { ensureWorkspaceTrial } from "@/features/billing/server/trials"
import {
  ensureEmployeeStaffGroup,
  isEmployeeStaffGroup,
} from "@/features/staff-groups/server/shared"
import { toIsoString } from "@/features/onboarding/utils/invite-utils"

async function getActiveOrganizationState(organizationId: string) {
  await ensureEmployeeStaffGroup({
    organizationId,
    locationId: null,
  })

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
  const trial = await ensureWorkspaceTrial({ organizationId })
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
    staffGroups: (staffGroupsResult.data ?? []).map((staffGroup) => ({
      id: staffGroup.id,
      name: staffGroup.name,
      slug: staffGroup.slug,
      isFallback: isEmployeeStaffGroup(staffGroup),
    })).sort((left, right) => {
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

async function getActiveLocationState(locationId: string) {
  await ensureLocationEmployeeStaffGroup(locationId)

  const database = getDatabase()
  const now = new Date()
  const [
    locationResult,
    staffGroupsResult,
    zonesCountResult,
    inviteLinksResult,
  ] = await Promise.all([
    database.query<{
      id: string
      name: string
      slug: string
      organization_id: string | null
    }>(
      `select id, name, slug, organization_id
       from public.locations
       where id = $1`,
      [locationId],
    ),
    database.query<{
      id: string
      name: string
      slug: string
      is_default: boolean
    }>(
      `select id, name, slug, is_default
       from public.staff_groups
       where location_id = $1
       order by name asc`,
      [locationId],
    ),
    database.query(
      `select id
       from public.zones
       where location_id = $1
       limit 1`,
      [locationId],
    ),
    database.query<{ expires_at: Date | string | null }>(
      `select expires_at
       from public.staff_invite_links
       where location_id = $1
         and disabled_at is null`,
      [locationId],
    ),
  ])
  const location = locationResult.rows.at(0)

  if (!location) {
    throw new Error("We could not load your location.")
  }

  const hasInviteLink = inviteLinksResult.rows.some((invite) => {
    return (
      invite.expires_at === null ||
      new Date(invite.expires_at).getTime() > now.getTime()
    )
  })
  const hasZone = zonesCountResult.rows.length > 0
  const trial = await ensureWorkspaceTrial({ locationId: location.id })

  return {
    onboarding: {
      organizationId: location.organization_id,
      locationId: location.id,
      trialStartedAt: trial.trialStartedAt,
      trialEndsAt: trial.trialEndsAt,
      completedAt: toIsoString(new Date()),
      lastStep: "complete",
      hasLocation: true,
      hasZone,
      hasInviteLink,
    } satisfies ActiveOnboardingState,
    trial,
    locations: [
      {
        id: location.id,
        name: location.name,
        slug: location.slug,
        organizationId: location.organization_id,
      },
    ],
    staffGroups: staffGroupsResult.rows
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

async function ensureLocationEmployeeStaffGroup(locationId: string) {
  const database = getDatabase()
  const existingResult = await database.query<{ id: string }>(
    `select id
     from public.staff_groups
     where location_id = $1
       and (slug = 'employee' or slug = 'employees' or is_default = true)
     order by created_at asc
     limit 1`,
    [locationId],
  )
  const existing = existingResult.rows.at(0)

  if (!existing) {
    await database.query(
      `insert into public.staff_groups (
         location_id,
         name,
         slug,
         is_default,
         color
       ) values ($1, 'Employee', 'employee', true, 'emerald')`,
      [locationId],
    )

    return
  }

  await database.query(
    `update public.staff_groups
     set name = 'Employee',
         slug = 'employee',
         is_default = true,
         color = 'emerald',
         updated_at = timezone('utc', now())
     where id = $1`,
    [existing.id],
  )
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

async function createUniqueLocationSlug(
  organizationId: string | null,
  name: string,
) {
  const supabase = createSupabaseServerClient()
  const baseSlug = slugify(name) || "location"
  let nextSlug = baseSlug
  let counter = 2

  for (;;) {
    const query = supabase
      .from("locations")
      .select("id")
      .eq("slug", nextSlug)

    const { data, error } = await (organizationId === null
      ? query.is("organization_id", null)
      : query.eq("organization_id", organizationId)
    ).maybeSingle()

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
  ensureLocationEmployeeStaffGroup,
  getActiveOrganizationState,
  getActiveLocationState,
  upsertOnboardingState,
}
