import "@tanstack/react-start/server-only"

import { getDatabase } from "@rocketrota/db"

import { writeAdminAuditLog } from "@/features/audit/server/audit-log"

async function updateErrorStatus(input: {
  adminUserId: string
  id: string
  status: "open" | "reviewing" | "resolved" | "ignored"
}) {
  const result = await getDatabase().query<{ id: string }>(
    `update admin_private.app_error_reports
     set status = $2,
         resolved_at = case when $2 in ('resolved', 'ignored') then timezone('utc', now()) else null end,
         resolved_by_admin_user_id = case when $2 in ('resolved', 'ignored') then $3 else null end
     where id = $1
     returning id`,
    [input.id, input.status, input.adminUserId],
  )

  if (!result.rows.at(0)) {
    throw new Error("Choose a valid error report.")
  }

  await writeAdminAuditLog({
    action: "error_report.status_updated",
    adminUserId: input.adminUserId,
    afterState: { status: input.status },
    permission: "errors.manage",
    targetId: input.id,
    targetType: "app_error_report",
  })
}

export { updateErrorStatus }
