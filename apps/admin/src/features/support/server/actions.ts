import "@tanstack/react-start/server-only"

import { getDatabase } from "@rocketrota/db"

import { writeAdminAuditLog } from "@/features/audit/server/audit-log"

async function updateSupportThreadStatus(input: {
  adminUserId: string
  id: string
  status: "open" | "waiting" | "resolved" | "closed"
}) {
  const result = await getDatabase().query<{ id: string }>(
    `update admin_private.support_threads
     set status = $2,
         updated_at = timezone('utc', now())
     where id = $1
     returning id`,
    [input.id, input.status],
  )

  if (!result.rows.at(0)) {
    throw new Error("Choose a valid support thread.")
  }

  await writeAdminAuditLog({
    action: "support_thread.status_updated",
    adminUserId: input.adminUserId,
    afterState: { status: input.status },
    permission: "support.manage",
    targetId: input.id,
    targetType: "support_thread",
  })
}

export { updateSupportThreadStatus }
