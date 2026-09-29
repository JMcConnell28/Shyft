import "@tanstack/react-start/server-only"

import type { SupportCategory } from "@/features/support/types"
import { getDatabase } from "@/lib/db"

async function createCustomerSupportThread(input: {
  organizationId: string
  userId: string
  subject: string
  category: SupportCategory
  locationId: string | null
  body: string
}): Promise<{ id: string }> {
  const client = await getDatabase().connect()
  try {
    await client.query("begin")
    if (input.locationId) {
      const location = await client.query<{ id: string }>(
        `select id from public.locations
         where id = $1 and organization_id = $2`,
        [input.locationId, input.organizationId]
      )
      if (!location.rows[0]) {
        throw new Error("Choose a valid workplace location.")
      }
    }
    const result = await client.query<{ id: string }>(
      `insert into admin_private.support_threads
         (created_by_user_id, organization_id, location_id, subject, category)
       values ($1, $2, $3, $4, $5) returning id`,
      [
        input.userId,
        input.organizationId,
        input.locationId,
        input.subject,
        input.category,
      ]
    )
    const thread = result.rows.at(0)
    if (!thread) throw new Error("We could not create that support request.")
    await client.query(
      `insert into admin_private.support_messages
         (thread_id, author_type, user_id, body)
       values ($1, 'user', $2, $3)`,
      [thread.id, input.userId, input.body]
    )
    await client.query("commit")
    return { id: thread.id }
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}

async function replyToCustomerSupportThread(input: {
  organizationId: string
  threadId: string
  userId: string
  body: string
}): Promise<void> {
  const client = await getDatabase().connect()
  try {
    await client.query("begin")
    const result = await client.query<{ id: string; status: string }>(
      `select id, status from admin_private.support_threads
       where id = $1 and organization_id = $2 and created_by_user_id = $3
       for update`,
      [input.threadId, input.organizationId, input.userId]
    )
    const thread = result.rows.at(0)
    if (!thread || thread.status === "closed") {
      throw new Error("We could not find an active support request.")
    }
    await client.query(
      `insert into admin_private.support_messages
         (thread_id, author_type, user_id, body)
       values ($1, 'user', $2, $3)`,
      [input.threadId, input.userId, input.body]
    )
    await client.query(
      `update admin_private.support_threads
       set status = 'open', updated_at = clock_timestamp()
       where id = $1`,
      [input.threadId]
    )
    await client.query("commit")
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}

export { createCustomerSupportThread, replyToCustomerSupportThread }
