import "@tanstack/react-start/server-only"

import { createHash, randomBytes } from "node:crypto"

import { getDatabase } from "@rocketrota/db"

import { writeAdminAuditLog } from "@/features/audit/server/audit-log"
import { getOptionalEnv } from "@/lib/env.server"
import type { ImpersonationLaunch } from "@/features/users/types"

async function updateAppUserStatus(input: {
  adminUserId: string
  reason?: string
  status: "active" | "deactivated"
  userId: string
}) {
  await getDatabase().query(
    `insert into admin_private.app_user_status_overrides (
       user_id,
       status,
       reason,
       updated_by_admin_user_id,
       updated_at
     ) values ($1, $2, $3, $4, timezone('utc', now()))
     on conflict (user_id)
     do update set status = excluded.status,
                   reason = excluded.reason,
                   updated_by_admin_user_id = excluded.updated_by_admin_user_id,
                   updated_at = excluded.updated_at`,
    [input.userId, input.status, input.reason ?? null, input.adminUserId],
  )

  await writeAdminAuditLog({
    action: "app_user.status_updated",
    adminUserId: input.adminUserId,
    afterState: { reason: input.reason ?? null, status: input.status },
    permission: "users.manage",
    targetId: input.userId,
    targetType: "app_user",
  })
}

async function createReadOnlyImpersonationSession(input: {
  adminUserId: string
  reason: string
  userId: string
}): Promise<ImpersonationLaunch> {
  const token = randomBytes(32).toString("base64url")
  const tokenHash = createHash("sha256").update(token).digest("hex")
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await getDatabase().query(
    `insert into admin_private.impersonation_sessions (
       token_hash,
       admin_user_id,
       target_user_id,
       reason,
       is_read_only,
       expires_at
     ) values ($1, $2, $3, $4, true, $5)`,
    [tokenHash, input.adminUserId, input.userId, input.reason, expiresAt],
  )

  await writeAdminAuditLog({
    action: "impersonation.created",
    adminUserId: input.adminUserId,
    afterState: { isReadOnly: true, reason: input.reason },
    permission: "users.impersonate",
    targetId: input.userId,
    targetType: "app_user",
  })

  const appBaseUrl = getOptionalEnv("APP_BASE_URL") ?? "http://localhost:3000"

  return {
    expiresAt: expiresAt.toISOString(),
    url: `${appBaseUrl}/support/impersonate?token=${token}`,
  }
}

export { createReadOnlyImpersonationSession, updateAppUserStatus }
