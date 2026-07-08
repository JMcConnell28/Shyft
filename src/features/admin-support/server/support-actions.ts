import "@tanstack/react-start/server-only"

import type { z } from "zod"

import type { createSupportThreadSchema } from "@/features/admin-support/schemas/support-schemas"
import { getDatabase } from "@/lib/db"

type CreateSupportThreadInput = z.infer<typeof createSupportThreadSchema>

async function createSupportThread(input: CreateSupportThreadInput) {
  const client = await getDatabase().connect()

  try {
    await client.query("BEGIN")

    const threadResult = await client.query<{ id: string }>(
      `insert into admin_private.support_threads (
         created_by_user_id,
         organization_id,
         location_id,
         subject,
         category,
         priority
       ) values ($1, $2, $3, $4, $5, $6)
       returning id`,
      [
        input.userId,
        input.organizationId ?? null,
        input.locationId ?? null,
        input.subject,
        input.category,
        input.priority,
      ],
    )
    const thread = threadResult.rows.at(0)

    if (!thread) {
      throw new Error("We could not create that support request.")
    }

    await client.query(
      `insert into admin_private.support_messages (
         thread_id,
         author_type,
         user_id,
         body
       ) values ($1, 'user', $2, $3)`,
      [thread.id, input.userId, input.body],
    )

    await client.query("COMMIT")
    return { id: thread.id }
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

export { createSupportThread }
