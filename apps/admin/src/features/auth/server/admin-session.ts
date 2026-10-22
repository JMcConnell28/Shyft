import "@tanstack/react-start/server-only"

import { adminRoles, roleHasAdminPermission } from "@rocketrota/shared/admin"
import { getDatabase, queryOne } from "@rocketrota/db"
import { APIError } from "better-auth/api"
import type { AdminRole } from "@rocketrota/shared/admin"

import type { AdminMembership } from "@/features/auth/types"

type AdminMembershipRow = {
  disabled_at: Date | string | null
  email: string
  name: string
  role: string
  user_id: string
}

async function ensureAdminMembershipForUser(input: {
  email?: string
  userId: string
}): Promise<AdminMembership> {
  const row = await queryOne<AdminMembershipRow>(
    `select
       id as user_id,
       email,
       name,
       role,
       disabled_at
     from admin_private.admin_user
     where id = $1
       and ($2::text is null or lower(email) = lower($2))
     limit 1`,
    [input.userId, input.email ?? null]
  )

  if (!row) {
    throw new Error("This admin account has not been provisioned.")
  }

  return mapAdminMembership(row)
}

async function getActiveAdminMembership(
  userId: string
): Promise<AdminMembership | null> {
  const membership = await ensureAdminMembershipForUser({ userId })

  if (membership.disabledAt) {
    // Recheck the database so an old session cannot outlive account disablement.
    await revokeAdminSessionsForUser(userId)
    return null
  }

  return membership
}

async function requireAdminMembership(
  userId: string
): Promise<AdminMembership> {
  const membership = await getActiveAdminMembership(userId)
  if (!membership) {
    throw new APIError("FORBIDDEN", {
      message: "This admin account has been disabled.",
    })
  }
  return membership
}

async function revokeAdminSessionsForUser(userId: string): Promise<void> {
  await getDatabase().query(
    'delete from admin_private.admin_session where "userId" = $1',
    [userId]
  )
}

async function requireAdminPermission(
  permission: Parameters<typeof roleHasAdminPermission>[1]
) {
  const { requireAdminSession } = await import("@/lib/auth-session.server")
  const { membership, session } = await requireAdminSession()

  if (!roleHasAdminPermission(membership.role, permission)) {
    throw new Error("You do not have permission to use this admin tool.")
  }

  return {
    membership,
    session,
  }
}

function mapAdminMembership(row: AdminMembershipRow): AdminMembership {
  const role = adminRoles.includes(row.role as AdminRole)
    ? (row.role as AdminRole)
    : "readonly"

  return {
    disabledAt: row.disabled_at
      ? new Date(row.disabled_at).toISOString()
      : null,
    email: row.email,
    name: row.name,
    role,
    userId: row.user_id,
  }
}

export {
  ensureAdminMembershipForUser,
  getActiveAdminMembership,
  requireAdminMembership,
  requireAdminPermission,
  revokeAdminSessionsForUser,
}
