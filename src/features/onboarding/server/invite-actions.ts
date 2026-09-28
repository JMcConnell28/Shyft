import { randomUUID } from "node:crypto"

import { createServerFn } from "@tanstack/react-start"
import { requireWorkspaceWriteAccess } from "@/features/billing/server/workspace-write-access"

import {
  acceptInviteSchema,
  acceptOrganizationInvitationSchema,
  organizationMemberInviteSchema,
  staffInviteSelectionSchema,
} from "@/lib/onboarding-schemas"
import { auth } from "@/lib/auth"
import { getDatabase } from "@/lib/db"
import { getOrganizationDashboardPath } from "@/lib/organization-paths"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"

import { createStaffJoinRequest } from "@/features/join-approvals/server/actions"
import { STAFF_INVITE_EXPIRY_DAYS } from "@/features/onboarding/constants"
import {
  getOrganizationSummaryById,
  requireVerifiedSessionOrThrow,
  setActiveOrganizationForHeaders,
} from "@/features/onboarding/server/session"
import { upsertOnboardingState } from "@/features/onboarding/server/state"
import { isEmployeeOnlyRole } from "@/features/onboarding/utils/employee-role"
import {
  buildStaffInviteUrl,
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

    if (!organizationId) {
      throw new Error("Choose an organisation before creating invite links.")
    }

    await requireOrgPermission({
      organizationId,
      userId: session.user.id,
      permissions: { invitation: ["create"] },
      errorMessage: "You do not have permission to create invite links.",
    })
    await ensureEmployeeStaffGroup({ organizationId, locationId: null })
    await requireWorkspaceWriteAccess({ organizationId })

    const supabase = createSupabaseServerClient()
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setDate(expiresAt.getDate() + STAFF_INVITE_EXPIRY_DAYS)

    const [locationResult, staffGroupResult] = await Promise.all([
      supabase
        .from("locations")
        .select("id")
        .eq("id", data.locationId)
        .eq("organization_id", organizationId)
        .maybeSingle(),
      supabase
        .from("staff_groups")
        .select("id")
        .eq("id", data.defaultStaffGroupId)
        .eq("organization_id", organizationId)
        .maybeSingle(),
    ])

    assertSupabaseSuccess(
      locationResult.error,
      "We could not verify that location."
    )
    assertSupabaseSuccess(
      staffGroupResult.error,
      "We could not verify that staff group."
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
      "We could not refresh the existing invite link."
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
        organizationId,
        data.locationId,
        data.defaultStaffGroupId,
        token,
        expiresAt.toISOString(),
        session.user.id,
      ]
    )

    await upsertOnboardingState(organizationId, {
      lastStep: "complete",
      completedAt: now,
    })

    return {
      joinUrl: buildStaffInviteUrl(token),
      token,
    }
  })

const getActiveStaffInviteLink = createServerFn({ method: "GET" }).handler(
  async () => {
    const { session } = await requireVerifiedSessionOrThrow()
    const organizationId = session.session.activeOrganizationId
    if (!organizationId) {
      throw new Error("Choose an organisation before opening invite links.")
    }

    await requireOrgPermission({
      organizationId,
      userId: session.user.id,
      permissions: { invitation: ["create"] },
      errorMessage: "You do not have permission to manage invite links.",
    })
    await ensureEmployeeStaffGroup({ organizationId, locationId: null })

    const supabase = createSupabaseServerClient()
    const now = new Date().toISOString()
    const [activeInviteResult, locationsResult, staffGroupsResult] =
      await Promise.all([
        supabase
          .from("staff_invite_links")
          .select(
            "location_id, default_staff_group_id, token, expires_at, created_at"
          )
          .eq("organization_id", organizationId)
          .is("disabled_at", null)
          .or(`expires_at.is.null,expires_at.gt.${now}`)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("locations")
          .select("id, name")
          .eq("organization_id", organizationId)
          .order("created_at", { ascending: true }),
        supabase
          .from("staff_groups")
          .select("id, name, slug, is_default")
          .eq("organization_id", organizationId)
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
      }))
    )
    const activeInvite = activeInviteResult.data
    const activeLocation = activeInvite
      ? ((locationsResult.data ?? []).find(
          (location) => location.id === activeInvite.location_id
        ) ?? null)
      : null
    const activeStaffGroup = activeInvite
      ? ((staffGroupsResult.data ?? []).find(
          (group) => group.id === activeInvite.default_staff_group_id
        ) ?? null)
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
    organizationMemberInviteSchema.parse(input)
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

    await requireWorkspaceWriteAccess({ organizationId })

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
        "organization_id, location_id, default_staff_group_id, expires_at, disabled_at"
      )
      .eq("token", data.token)
      .maybeSingle()

    assertSupabaseSuccess(
      inviteResult.error,
      "We could not load that invite link."
    )
    const invite = inviteResult.data

    if (!invite) {
      return null
    }

    const organizationId = invite.organization_id

    const [organizationResult, locationResult, staffGroupResult] =
      await Promise.all([
        supabase
          .from("organization")
          .select("name")
          .eq("id", organizationId)
          .maybeSingle(),
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
      "We could not load the organization for that invite."
    )
    assertSupabaseSuccess(
      locationResult.error,
      "We could not load the location for that invite."
    )
    assertSupabaseSuccess(
      staffGroupResult.error,
      "We could not load the staff group for that invite."
    )

    if (!locationResult.data || !staffGroupResult.data) {
      return null
    }

    const isExpired =
      invite.expires_at !== null &&
      new Date(invite.expires_at).getTime() <= Date.now()
    const isDisabled = invite.disabled_at !== null

    return {
      organizationId,
      organizationName:
        organizationResult.data?.name ?? locationResult.data.name,
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
    const { session } = await requireVerifiedSessionOrThrow()
    const supabase = createSupabaseServerClient()
    const inviteResult = await supabase
      .from("staff_invite_links")
      .select(
        "id, organization_id, location_id, default_staff_group_id, expires_at, disabled_at"
      )
      .eq("token", data.token)
      .maybeSingle()

    assertSupabaseSuccess(
      inviteResult.error,
      "We could not load that invite link."
    )
    const invite = inviteResult.data

    if (!invite) {
      throw new Error("That invite link is not valid anymore.")
    }

    if (invite.disabled_at) {
      throw new Error("That invite link has been turned off.")
    }

    if (
      invite.expires_at &&
      new Date(invite.expires_at).getTime() <= Date.now()
    ) {
      throw new Error("That invite link has expired.")
    }

    const organizationId = invite.organization_id

    await assertCanAcceptOrganizationStaffInvite({
      organizationId,
      locationId: invite.location_id,
      userId: session.user.id,
    })

    const requestId = await createStaffJoinRequest({
      inviteLinkId: invite.id,
      organizationId,
      locationId: invite.location_id,
      staffGroupId: invite.default_staff_group_id,
      userId: session.user.id,
    })
    return { redirectTo: `/join-status/${requestId}` }
  })

async function assertCanAcceptOrganizationStaffInvite(input: {
  organizationId: string
  locationId: string
  userId: string
}) {
  const membershipResult = await getDatabase().query<{ role: string }>(
    `select role
     from public."member"
     where "organizationId" = $1
       and "userId" = $2
     limit 1`,
    [input.organizationId, input.userId]
  )
  const membershipRole = membershipResult.rows.at(0)?.role ?? null

  if (membershipRole && !isEmployeeOnlyRole(membershipRole)) {
    throw new Error(
      "You already have elevated access to this organisation. Staff invite links are only for employees."
    )
  }

  const assignmentResult = await getDatabase().query<{ id: string }>(
    `select assignment.id
     from public.employees employee
     join public.employee_location_assignments assignment
       on assignment.employee_id = employee.id
     where employee.organization_id = $1
       and employee.user_id = $2
       and assignment.location_id = $3
       and assignment.is_enabled = true
       and assignment.disabled_at is null
     limit 1`,
    [input.organizationId, input.userId, input.locationId]
  )

  if (assignmentResult.rows.length > 0) {
    throw new Error("You are already part of this location.")
  }
}

const acceptOrganizationInvitation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    acceptOrganizationInvitationSchema.parse(input)
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
      "We could not load that invitation."
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

export {
  acceptOrganizationInvitation,
  acceptStaffInvite,
  createStaffInviteLink,
  getActiveStaffInviteLink,
  getStaffInvitePreview,
  inviteOrganizationMemberByEmail,
}
