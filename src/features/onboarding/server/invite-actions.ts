import { randomUUID } from "node:crypto"

import { createServerFn } from "@tanstack/react-start"

import {
  acceptInviteSchema,
  acceptOrganizationInvitationSchema,
  organizationMemberInviteSchema,
  staffInviteSelectionSchema,
} from "@/lib/onboarding-schemas"
import { auth } from "@/lib/auth"
import { getDatabase } from "@/lib/db"
import {
  getLocationDashboardPath,
  getOrganizationDashboardPath,
} from "@/lib/organization-paths"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import {
  assertSupabaseSuccess,
  getRequiredSupabaseRow,
} from "@/lib/supabase-errors"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import { requireLocationPermission } from "@/lib/auth/has-location-permission"

import { syncWorkspaceBillingSubscriptionQuantities } from "@/features/billing/server/subscriptions"
import { STAFF_INVITE_EXPIRY_DAYS } from "@/features/onboarding/constants"
import {
  getOrganizationSummaryById,
  requireVerifiedSessionOrThrow,
  setActiveOrganizationForHeaders,
} from "@/features/onboarding/server/session"
import { upsertOnboardingState } from "@/features/onboarding/server/state"
import {
  buildStaffInviteUrl,
  createEmployeeMemberId,
  toIsoString,
} from "@/features/onboarding/utils/invite-utils"
import {
  ensureEmployeeStaffGroup,
  getEmployeeFallbackStaffGroup,
  isEmployeeStaffGroup,
} from "@/features/staff-groups/server/shared"

const createStaffInviteLink = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => staffInviteSelectionSchema.parse(input))
  .handler(async ({ data }) => {
    const { session } = await requireVerifiedSessionOrThrow()
    const organizationId = session.session.activeOrganizationId

    if (organizationId) {
      await requireOrgPermission({
        organizationId,
        userId: session.user.id,
        permissions: {
          invitation: ["create"],
        },
        errorMessage: "You do not have permission to create invite links.",
      })

      await ensureEmployeeStaffGroup({
        organizationId,
        locationId: null,
      })
    } else {
      await requireLocationPermission({
        locationId: data.locationId,
        userId: session.user.id,
        permissions: {
          invitation: ["create"],
        },
        errorMessage: "You do not have permission to create invite links.",
      })
    }

    const supabase = createSupabaseServerClient()
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setDate(expiresAt.getDate() + STAFF_INVITE_EXPIRY_DAYS)

    const [locationResult, staffGroupResult] = await Promise.all([
      supabase
        .from("locations")
        .select("id")
        .eq("id", data.locationId)
        .maybeSingle(),
      supabase
        .from("staff_groups")
        .select("id")
        .eq("id", data.defaultStaffGroupId)
        .maybeSingle(),
    ])

    assertSupabaseSuccess(
      locationResult.error,
      "We could not verify that location.",
    )
    assertSupabaseSuccess(
      staffGroupResult.error,
      "We could not verify that staff group.",
    )

    if (!locationResult.data || !staffGroupResult.data) {
      throw new Error("Choose a valid location and staff group.")
    }

    const disableResult = await supabase
      .from("staff_invite_links")
      .update({
        disabled_at: now.toISOString(),
      })
      .eq("location_id", data.locationId)
      .is("disabled_at", null)

    assertSupabaseSuccess(
      disableResult.error,
      "We could not refresh the existing invite link.",
    )

    const token = randomUUID().replace(/-/g, "")

    await getDatabase().query(
      `insert into public.staff_invite_links (
         organization_id,
         location_id,
         default_staff_group_id,
         token,
         expires_at,
         created_by
       ) values ($1, $2, $3, $4, $5, $6)`,
      [
        organizationId ?? null,
        data.locationId,
        data.defaultStaffGroupId,
        token,
        expiresAt.toISOString(),
        session.user.id,
      ],
    )

    if (organizationId) {
      await upsertOnboardingState(organizationId, {
        lastStep: "complete",
        completedAt: now,
      })
    }

    return {
      joinUrl: buildStaffInviteUrl(token),
      token,
    }
  })

const getActiveStaffInviteLink = createServerFn({ method: "GET" }).handler(
  async () => {
    const { session } = await requireVerifiedSessionOrThrow()
    const organizationId = session.session.activeOrganizationId
    const standaloneLocationId = organizationId
      ? null
      : await getFirstLocationMembershipId(session.user.id)

    if (!organizationId && !standaloneLocationId) {
      throw new Error("Choose a location before opening invite links.")
    }

    if (organizationId) {
      await requireOrgPermission({
        organizationId,
        userId: session.user.id,
        permissions: {
          invitation: ["create"],
        },
        errorMessage: "You do not have permission to manage invite links.",
      })

      await ensureEmployeeStaffGroup({
        organizationId,
        locationId: null,
      })
    } else {
      await requireLocationPermission({
        locationId: standaloneLocationId!,
        userId: session.user.id,
        permissions: {
          invitation: ["create"],
        },
        errorMessage: "You do not have permission to manage invite links.",
      })
    }

    const supabase = createSupabaseServerClient()
    const now = new Date().toISOString()
    const [activeInviteResult, locationsResult, staffGroupsResult] =
      await Promise.all([
        supabase
          .from("staff_invite_links")
          .select(
            "location_id, default_staff_group_id, token, expires_at, created_at"
          )
          .eq(organizationId ? "organization_id" : "location_id", organizationId ?? standaloneLocationId!)
          .is("disabled_at", null)
          .or(`expires_at.is.null,expires_at.gt.${now}`)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("locations")
          .select("id, name")
          .eq(organizationId ? "organization_id" : "id", organizationId ?? standaloneLocationId!)
          .order("created_at", { ascending: true }),
        supabase
          .from("staff_groups")
          .select("id, name, slug, is_default")
          .eq(organizationId ? "organization_id" : "location_id", organizationId ?? standaloneLocationId!)
          .order("name", { ascending: true }),
      ])

    assertSupabaseSuccess(
      activeInviteResult.error,
      "We could not load the current invite link."
    )
    assertSupabaseSuccess(
      locationsResult.error,
      "We could not load the invite locations."
    )
    assertSupabaseSuccess(
      staffGroupsResult.error,
      "We could not load the staff groups."
    )

    const defaultLocation = (locationsResult.data ?? []).at(0) ?? null
    const defaultStaffGroup = getEmployeeFallbackStaffGroup(
      (staffGroupsResult.data ?? []).map((group) => ({
        id: group.id,
        name: group.name,
        slug: group.slug,
        isFallback: isEmployeeStaffGroup(group),
        employeeCount: 0,
        color: "slate",
      })),
    )
    const activeInvite = activeInviteResult.data
    const activeLocation = activeInvite
      ? (locationsResult.data ?? []).find(
          (location) => location.id === activeInvite.location_id
        ) ?? null
      : null
    const activeStaffGroup = activeInvite
      ? (staffGroupsResult.data ?? []).find(
          (group) => group.id === activeInvite.default_staff_group_id
        ) ?? null
      : null

    return {
      activeInvite: activeInvite
        ? {
            joinUrl: buildStaffInviteUrl(activeInvite.token),
            expiresAt: activeInvite.expires_at,
            locationName: activeLocation?.name ?? "Unknown location",
            staffGroupName: activeStaffGroup?.name ?? "Unknown staff group",
          }
        : null,
      defaults:
        defaultLocation && defaultStaffGroup
          ? {
              locationId: defaultLocation.id,
              locationName: defaultLocation.name,
              defaultStaffGroupId: defaultStaffGroup.id,
              defaultStaffGroupName: defaultStaffGroup.name,
            }
          : null,
    }
  }
)

const inviteOrganizationMemberByEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    organizationMemberInviteSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const { headers, session } = await requireVerifiedSessionOrThrow()
    const organizationId = session.session.activeOrganizationId

    if (!organizationId) {
      throw new Error("Choose an organization before sending invitations.")
    }

    await requireOrgPermission({
      organizationId,
      userId: session.user.id,
      permissions: {
        invitation: ["create"],
      },
      errorMessage: "You do not have permission to invite team members.",
    })

    await auth.api.createInvitation({
      headers,
      body: {
        email: data.email,
        role: data.role,
        organizationId,
      },
    })

    return { success: true }
  })

const getStaffInvitePreview = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => acceptInviteSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient()
    const inviteResult = await supabase
      .from("staff_invite_links")
      .select(
        "organization_id, location_id, default_staff_group_id, expires_at, disabled_at",
      )
      .eq("token", data.token)
      .maybeSingle()

    assertSupabaseSuccess(
      inviteResult.error,
      "We could not load that invite link.",
    )
    const invite = inviteResult.data

    if (!invite) {
      return null
    }

    const [organizationResult, locationResult, staffGroupResult] = await Promise.all([
      invite.organization_id
        ? supabase
            .from("organization")
            .select("name")
            .eq("id", invite.organization_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from("locations")
        .select("name")
        .eq("id", invite.location_id)
        .maybeSingle(),
      supabase
        .from("staff_groups")
        .select("name")
        .eq("id", invite.default_staff_group_id)
        .maybeSingle(),
    ])

    assertSupabaseSuccess(
      organizationResult.error,
      "We could not load the organization for that invite.",
    )
    assertSupabaseSuccess(
      locationResult.error,
      "We could not load the location for that invite.",
    )
    assertSupabaseSuccess(
      staffGroupResult.error,
      "We could not load the staff group for that invite.",
    )

    if (!locationResult.data || !staffGroupResult.data) {
      return null
    }

    const isExpired =
      invite.expires_at !== null &&
      new Date(invite.expires_at).getTime() <= Date.now()
    const isDisabled = invite.disabled_at !== null

    return {
      organizationId: invite.organization_id,
      organizationName: organizationResult.data?.name ?? locationResult.data.name,
      locationName: locationResult.data.name,
      staffGroupName: staffGroupResult.data.name,
      expiresAt: toIsoString(invite.expires_at),
      isDisabled,
      isExpired,
    }
  })

const acceptStaffInvite = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => acceptInviteSchema.parse(input))
  .handler(async ({ data }) => {
    const { headers, session } = await requireVerifiedSessionOrThrow()
    const supabase = createSupabaseServerClient()
    const inviteResult = await supabase
      .from("staff_invite_links")
      .select(
        "organization_id, location_id, default_staff_group_id, expires_at, disabled_at",
      )
      .eq("token", data.token)
      .maybeSingle()

    assertSupabaseSuccess(
      inviteResult.error,
      "We could not load that invite link.",
    )
    const invite = inviteResult.data

    if (!invite) {
      throw new Error("That invite link is not valid anymore.")
    }

    if (invite.disabled_at) {
      throw new Error("That invite link has been turned off.")
    }

    if (invite.expires_at && new Date(invite.expires_at).getTime() <= Date.now()) {
      throw new Error("That invite link has expired.")
    }

    if (invite.organization_id) {
      const membershipResult = await supabase
        .from("member")
        .select("id")
        .eq("organizationId", invite.organization_id)
        .eq("userId", session.user.id)
        .maybeSingle()

      assertSupabaseSuccess(
        membershipResult.error,
        "We could not verify your organization membership.",
      )

      if (!membershipResult.data) {
        const membershipInsertResult = await supabase.from("member").insert({
          id: createEmployeeMemberId(),
          organizationId: invite.organization_id,
          userId: session.user.id,
          role: "employee",
          createdAt: new Date().toISOString(),
        })

        assertSupabaseSuccess(
          membershipInsertResult.error,
          "We could not join you to that organization.",
        )
      }

      await setActiveOrganizationForHeaders(headers, invite.organization_id)
    } else {
      await getDatabase().query(
        `insert into public.location_memberships (
           location_id,
           user_id,
           role
         ) values ($1, $2, 'employee')
         on conflict (location_id, user_id)
         do update set role = excluded.role,
                       updated_at = timezone('utc', now())`,
        [invite.location_id, session.user.id],
      )
    }

    const employeeLookupQuery = supabase
      .from("employees")
      .select("id")
      .eq("user_id", session.user.id)
    const employeeLookupResult = await (invite.organization_id
      ? employeeLookupQuery.eq("organization_id", invite.organization_id)
      : employeeLookupQuery.eq("location_id", invite.location_id)).maybeSingle()

    assertSupabaseSuccess(
      employeeLookupResult.error,
      "We could not load your employee record.",
    )

    const employeePayload = {
      organization_id: invite.organization_id,
      location_id: invite.organization_id ? null : invite.location_id,
      user_id: session.user.id,
      staff_group_id: invite.default_staff_group_id,
      full_name: session.user.name,
      email: session.user.email,
      status: "active",
      updated_at: new Date().toISOString(),
    }

    const employeeResult = employeeLookupResult.data
      ? await supabase
          .from("employees")
          .update(employeePayload)
          .eq("id", employeeLookupResult.data.id)
          .select("id")
          .single()
      : await supabase
          .from("employees")
          .insert(employeePayload)
          .select("id")
          .single()

    assertSupabaseSuccess(
      employeeResult.error,
      "We could not attach you to this workplace.",
    )

    const employeeId = getRequiredSupabaseRow(
      employeeResult.data,
      "We could not attach you to this workplace.",
    ).id

    const assignmentResult = await supabase
      .from("employee_location_assignments")
      .upsert(
        {
          organization_id: invite.organization_id,
          employee_id: employeeId,
          location_id: invite.location_id,
          is_enabled: true,
          disabled_at: null,
        },
        {
          onConflict: "employee_id,location_id",
        },
      )

    assertSupabaseSuccess(
      assignmentResult.error,
      "We could not enable that workplace assignment.",
    )
    await syncBillingAfterStaffInvite({
      organizationId: invite.organization_id,
      locationId: invite.location_id,
      userId: session.user.id,
    })

    const organization = invite.organization_id
      ? await getOrganizationSummaryById(invite.organization_id)
      : null
    const location = organization
      ? null
      : await getLocationSlugById(invite.location_id)

    return {
      redirectTo: organization
        ? getOrganizationDashboardPath(organization.slug)
        : location
          ? getLocationDashboardPath(location.slug)
          : "/dashboard",
    }
  })

async function syncBillingAfterStaffInvite(input: {
  organizationId: string | null
  locationId: string
  userId: string
}) {
  try {
    await syncWorkspaceBillingSubscriptionQuantities({
      organizationId: input.organizationId ?? undefined,
      locationId: input.organizationId ? undefined : input.locationId,
      userId: input.userId,
    })
  } catch (error) {
    console.warn("Could not sync billing quantities after staff invite.", error)
  }
}

const acceptOrganizationInvitation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    acceptOrganizationInvitationSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const { headers } = await requireVerifiedSessionOrThrow()
    const supabase = createSupabaseServerClient()
    const invitationResult = await supabase
      .from("invitation")
      .select("organizationId")
      .eq("id", data.invitationId)
      .maybeSingle()

    assertSupabaseSuccess(
      invitationResult.error,
      "We could not load that invitation.",
    )
    const organizationId = invitationResult.data?.organizationId ?? null

    await auth.api.acceptInvitation({
      headers,
      body: {
        invitationId: data.invitationId,
      },
    })

    if (organizationId) {
      await setActiveOrganizationForHeaders(headers, organizationId)
    }

    const organization = organizationId
      ? await getOrganizationSummaryById(organizationId)
      : null

    return {
      redirectTo: organization
        ? getOrganizationDashboardPath(organization.slug)
        : "/dashboard",
    }
  })

async function getFirstLocationMembershipId(userId: string) {
  const result = await getDatabase().query<{ location_id: string }>(
    `select location_id
     from public.location_memberships
     where user_id = $1
     order by created_at asc
     limit 1`,
    [userId],
  )

  return result.rows.at(0)?.location_id ?? null
}

async function getLocationSlugById(locationId: string) {
  const result = await getDatabase().query<{ slug: string }>(
    `select slug
     from public.locations
     where id = $1
     limit 1`,
    [locationId],
  )

  return result.rows.at(0) ?? null
}

export {
  acceptOrganizationInvitation,
  acceptStaffInvite,
  createStaffInviteLink,
  getActiveStaffInviteLink,
  getStaffInvitePreview,
  inviteOrganizationMemberByEmail,
}

