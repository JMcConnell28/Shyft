import type { OrganizationRole } from "@/lib/auth/permissions"
import { getAuthRequestHeaders } from "@/lib/auth-session.server"
import { getDevRoleOverride } from "@/lib/auth/dev-role-override"
import { roles } from "@/lib/auth/permissions"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"

type OrganizationPermissionRequest = Parameters<
  (typeof roles)[OrganizationRole]["authorize"]
>[0]

async function getOrganizationRole(
  organizationId: string,
  userId: string,
): Promise<OrganizationRole | null> {
  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("member")
    .select("role")
    .eq("organizationId", organizationId)
    .eq("userId", userId)
    .maybeSingle()

  assertSupabaseSuccess(result.error, "We could not load your role.")

  const role = result.data?.role

  if (!role || !(role in roles)) {
    return null
  }

  const resolvedRole = role as OrganizationRole
  const requestHeaders = getAuthRequestHeaders()
  const devRoleOverride = getDevRoleOverride(
    requestHeaders.get("cookie"),
    organizationId,
  )

  return devRoleOverride ?? resolvedRole
}

function hasOrgPermissionForRole(
  role: OrganizationRole | null,
  permissions: OrganizationPermissionRequest,
) {
  if (!role) {
    return false
  }

  return roles[role].authorize(permissions).success
}

async function hasOrgPermission({
  organizationId,
  userId,
  permissions,
}: {
  organizationId: string
  userId: string
  permissions: OrganizationPermissionRequest
}) {
  const role = await getOrganizationRole(organizationId, userId)

  return hasOrgPermissionForRole(role, permissions)
}

async function requireOrgPermission({
  organizationId,
  userId,
  permissions,
  errorMessage = "You do not have permission to perform that action.",
}: {
  organizationId: string
  userId: string
  permissions: OrganizationPermissionRequest
  errorMessage?: string
}) {
  const role = await getOrganizationRole(organizationId, userId)

  if (!hasOrgPermissionForRole(role, permissions)) {
    throw new Error(errorMessage)
  }

  return role
}

export {
  getOrganizationRole,
  hasOrgPermission,
  hasOrgPermissionForRole,
  requireOrgPermission,
}
export type { OrganizationPermissionRequest }
