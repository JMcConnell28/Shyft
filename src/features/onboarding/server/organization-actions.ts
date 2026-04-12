import { createServerFn } from "@tanstack/react-start"

import {
  activateOrganizationSchema,
  locationSetupSchema,
  normalizeOrganizationSlug,
  normalizeZoneName,
  organizationSetupSchema,
  verifyEmailSchema,
} from "@/lib/onboarding-schemas"
import { auth } from "@/lib/auth"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"

import { FREE_TRIAL_DAYS } from "@/features/onboarding/constants"
import {
  requireSessionOrThrow,
  requireVerifiedSessionOrThrow,
  setActiveOrganizationForHeaders,
} from "@/features/onboarding/server/session"
import {
  createUniqueLocationSlug,
  ensureDefaultStaffGroup,
  upsertOnboardingState,
} from "@/features/onboarding/server/state"
import { createSupabaseServerClient } from "@/lib/supabase"
import {
  assertSupabaseSuccess,
  getRequiredSupabaseRow,
} from "@/lib/supabase-errors"

const resendVerificationEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => verifyEmailSchema.parse(input))
  .handler(async ({ data }) => {
    await auth.api.sendVerificationEmail({
      body: {
        email: data.email,
        callbackURL: data.callbackURL,
      },
    })

    return { success: true }
  })

const checkOrganizationSlugAvailability = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    organizationSetupSchema.pick({ slug: true }).parse(input),
  )
  .handler(async ({ data }) => {
    const { headers } = await requireSessionOrThrow()
    const result = await auth.api.checkOrganizationSlug({
      headers,
      body: {
        slug: normalizeOrganizationSlug(data.slug),
      },
    })

    return {
      available: Boolean(result.status),
    }
  })

const activateOrganization = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => activateOrganizationSchema.parse(input))
  .handler(async ({ data }) => {
    const { headers } = await requireSessionOrThrow()

    await setActiveOrganizationForHeaders(headers, data.organizationId)

    return { success: true }
  })

const createOrganizationWithBootstrap = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => organizationSetupSchema.parse(input))
  .handler(async ({ data }) => {
    const { headers } = await requireVerifiedSessionOrThrow()
    const organizationName = data.name.trim()
    const slug = normalizeOrganizationSlug(data.slug)

    const availability = await auth.api.checkOrganizationSlug({
      headers,
      body: { slug },
    })

    if (!availability.status) {
      throw new Error("That organization URL is already in use.")
    }

    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + FREE_TRIAL_DAYS)

    const organization = await auth.api.createOrganization({
      headers,
      body: {
        name: organizationName,
        slug,
        metadata: {
          trialStartedAt: new Date().toISOString(),
          trialEndsAt: trialEndsAt.toISOString(),
        },
      },
    })

    if (!organization) {
      throw new Error("We could not create your organization.")
    }

    await Promise.all([
      upsertOnboardingState(organization.id, {
        trialEndsAt,
        lastStep: "location",
      }),
      ensureDefaultStaffGroup(organization.id),
      setActiveOrganizationForHeaders(headers, organization.id),
    ])

    return {
      organizationId: organization.id,
      redirectTo: "/onboarding/location" as const,
    }
  })

const createFirstLocationAndZone = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => locationSetupSchema.parse(input))
  .handler(async ({ data }) => {
    const { session } = await requireVerifiedSessionOrThrow()
    const organizationId = session.session.activeOrganizationId

    if (!organizationId) {
      throw new Error("Choose an organization before adding a location.")
    }

    await requireOrgPermission({
      organizationId,
      userId: session.user.id,
      permissions: {
        location: ["create"],
      },
      errorMessage: "You do not have permission to create locations.",
    })

    const supabase = createSupabaseServerClient()
    const locationName = data.locationName.trim()
    const zoneName = normalizeZoneName(data.zoneName)
    const locationSlug = await createUniqueLocationSlug(organizationId, locationName)

    const locationResult = await supabase
      .from("locations")
      .insert({
        organization_id: organizationId,
        name: locationName,
        slug: locationSlug,
      })
      .select("id")
      .single()

    assertSupabaseSuccess(
      locationResult.error,
      "We could not save your first location.",
    )
    const locationId = getRequiredSupabaseRow(
      locationResult.data,
      "We could not save your first location.",
    ).id

    const zoneResult = await supabase.from("zones").insert({
      organization_id: organizationId,
      location_id: locationId,
      name: zoneName,
      sort_order: 0,
    })

    assertSupabaseSuccess(zoneResult.error, "We could not save your first zone.")

    await upsertOnboardingState(organizationId, {
      lastStep: "invite",
    })

    return {
      locationId,
      redirectTo: "/onboarding/invite" as const,
    }
  })

export {
  activateOrganization,
  checkOrganizationSlugAvailability,
  createFirstLocationAndZone,
  createOrganizationWithBootstrap,
  resendVerificationEmail,
}

