import { createServerFn } from "@tanstack/react-start"
import {
  getOrganizationSummaryById,
  requireVerifiedSessionOrThrow,
  setActiveOrganizationForHeaders,
} from "./session"
import {
  acceptOrganizationInvitationSchema,
  organizationMemberInviteSchema,
} from "@/lib/onboarding-schemas"
import { auth } from "@/lib/auth"
import { getOrganizationDashboardPath } from "@/lib/organization-paths"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import { requireWorkspaceWriteAccess } from "@/features/billing/server/workspace-write-access"

export {
  acceptStaffInvite,
  createStaffInviteLink,
  getActiveStaffInviteLink,
  getStaffInvitePreview,
} from "./staff-invite-server-fns"

const inviteOrganizationMemberByEmail = createServerFn({ method: "POST" })
  .validator((input: unknown) => organizationMemberInviteSchema.parse(input))
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

const acceptOrganizationInvitation = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
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

export { inviteOrganizationMemberByEmail, acceptOrganizationInvitation }
