import { randomUUID } from "node:crypto"

import { createServerFn } from "@tanstack/react-start"

import {
  acceptInviteSchema,
  acceptOrganizationInvitationSchema,
  organizationMemberInviteSchema,
  staffInviteSelectionSchema,
} from "@/lib/onboarding-schemas"
import { auth } from "@/lib/auth"
import { getOrganizationDashboardPath } from "@/lib/organization-paths"
import { createSupabaseServerClient } from "@/lib/supabase"
import {
  assertSupabaseSuccess,
  getRequiredSupabaseRow,
} from "@/lib/supabase-errors"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"

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

const createStaffInviteLink = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => staffInviteSelectionSchema.parse(input))
  .handler(async ({ data }) => {
    const { session } = await requireVerifiedSessionOrThrow()
    const organizationId = session.session.activeOrganizationId

    if (!organizationId) {
      throw new Error("Choose an organization before creating an invite link.")
    }

    await requireOrgPermission({
      organizationId,
      userId: session.user.id,
      permissions: {
        invitation: ["create"],
      },
      errorMessage: "You do not have permission to create invite links.",
    })

    const supabase = createSupabaseServerClient()
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setDate(expiresAt.getDate() + STAFF_INVITE_EXPIRY_DAYS)

    const [locationResult, staffGroupResult] = await Promise.all([
      supabase
        .from("locations")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("id", data.locationId)
        .maybeSingle(),
      supabase
        .from("staff_groups")
        .select("id")
        .eq("organization_id", organizationId)
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
      .eq("organization_id", organizationId)
      .is("disabled_at", null)

    assertSupabaseSuccess(
      disableResult.error,
      "We could not refresh the existing invite link.",
    )

    const token = randomUUID().replace(/-/g, "")

    const inviteInsertResult = await supabase.from("staff_invite_links").insert({
      location_id: data.locationId,
      default_staff_group_id: data.defaultStaffGroupId,
      token,
      expires_at: expiresAt.toISOString(),
      created_by: session.user.id,
      organization_id: organizationId,
    })

    assertSupabaseSuccess(
      inviteInsertResult.error,
      "We could not create the invite link.",
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
      supabase
        .from("organization")
        .select("name")
        .eq("id", invite.organization_id)
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

    if (
      !organizationResult.data ||
      !locationResult.data ||
      !staffGroupResult.data
    ) {
      return null
    }

    const isExpired =
      invite.expires_at !== null &&
      new Date(invite.expires_at).getTime() <= Date.now()
    const isDisabled = invite.disabled_at !== null

    return {
      organizationId: invite.organization_id,
      organizationName: organizationResult.data.name,
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

    const employeeLookupResult = await supabase
      .from("employees")
      .select("id")
      .eq("organization_id", invite.organization_id)
      .eq("user_id", session.user.id)
      .maybeSingle()

    assertSupabaseSuccess(
      employeeLookupResult.error,
      "We could not load your employee record.",
    )

    const employeePayload = {
      organization_id: invite.organization_id,
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

    const organization = await getOrganizationSummaryById(invite.organization_id)

    return {
      redirectTo: organization
        ? getOrganizationDashboardPath(organization.slug)
        : "/dashboard",
    }
  })

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

export {
  acceptOrganizationInvitation,
  acceptStaffInvite,
  createStaffInviteLink,
  getStaffInvitePreview,
  inviteOrganizationMemberByEmail,
}

