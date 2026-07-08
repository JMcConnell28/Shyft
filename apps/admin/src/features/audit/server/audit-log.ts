import "@tanstack/react-start/server-only"

import { getDatabase } from "@rocketrota/db"

type AuditLogInput = {
  action: string
  adminUserId: string
  afterState?: unknown
  beforeState?: unknown
  metadata?: Record<string, unknown>
  permission?: string
  targetId?: string | null
  targetType: string
}

async function writeAdminAuditLog(input: AuditLogInput) {
  await getDatabase().query(
    `insert into admin_private.admin_audit_logs (
       admin_user_id,
       action,
       target_type,
       target_id,
       permission,
       before_state,
       after_state,
       metadata
     ) values ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      input.adminUserId,
      input.action,
      input.targetType,
      input.targetId ?? null,
      input.permission ?? null,
      input.beforeState ? JSON.stringify(input.beforeState) : null,
      input.afterState ? JSON.stringify(input.afterState) : null,
      JSON.stringify(input.metadata ?? {}),
    ],
  )
}

export { writeAdminAuditLog }
