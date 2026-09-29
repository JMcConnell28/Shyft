import "@tanstack/react-start/server-only"

import { getDatabase } from "@rocketrota/db"

import { writeAdminAuditLog } from "@/features/audit/server/audit-log"

async function updateSupportThreadStatus(input: {
  adminUserId: string
  id: string
  status: "resolved"
}) {
  const client = await getDatabase().connect()
  let changed = false
  try {
    await client.query("begin")
    const result = await client.query<{ status: string }>(
      `select status from admin_private.support_threads where id = $1 for update`,
      [input.id]
    )
    const thread = result.rows[0]
    if (!thread) throw new Error("Choose a valid support thread.")
    if (thread.status !== "resolved") {
      await client.query(
        `update admin_private.support_threads
         set status = 'resolved', updated_at = clock_timestamp()
         where id = $1`,
        [input.id]
      )
      await client.query(
        `insert into admin_private.support_messages
           (thread_id, author_type, admin_user_id, body)
         values ($1, 'system', $2, 'RocketRota support marked this request resolved.')`,
        [input.id, input.adminUserId]
      )
      changed = true
    }
    await client.query("commit")
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }

  if (changed) {
    await writeAdminAuditLog({
      action: "support_thread.status_updated",
      adminUserId: input.adminUserId,
      afterState: { status: input.status },
      permission: "support.manage",
      targetId: input.id,
      targetType: "support_thread",
    })
  }
}

async function replyToSupportThread(input: {
  adminUserId: string
  id: string
  body: string
}) {
  const client = await getDatabase().connect()
  try {
    await client.query("begin")
    const result = await client.query<{ id: string }>(
      `select id from admin_private.support_threads where id = $1 for update`,
      [input.id]
    )
    if (!result.rows[0]) throw new Error("Choose a valid support thread.")
    await client.query(
      `insert into admin_private.support_messages
         (thread_id, author_type, admin_user_id, body)
       values ($1, 'admin', $2, $3)`,
      [input.id, input.adminUserId, input.body]
    )
    await client.query(
      `update admin_private.support_threads
       set status = 'waiting', updated_at = clock_timestamp()
       where id = $1`,
      [input.id]
    )
    await client.query("commit")
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
  await writeAdminAuditLog({
    action: "support_thread.replied",
    adminUserId: input.adminUserId,
    permission: "support.manage",
    targetId: input.id,
    targetType: "support_thread",
  })
}

export { replyToSupportThread, updateSupportThreadStatus }
