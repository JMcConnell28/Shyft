import "@tanstack/react-start/server-only"

import { z } from "zod"
import { getDatabase } from "@/lib/db"

const pendingRequestSchema = z.object({ id: z.string().uuid() })

// The caller supplies the verified session's user ID, never client input.
async function findLatestPendingJoinRequestId(
  userId: string
): Promise<string | null> {
  const result = await getDatabase().query<{ id: string }>(
    `select id from public.staff_join_requests
     where user_id = $1 and status = 'pending'
     order by created_at desc
     limit 1`,
    [userId]
  )
  const row = result.rows.at(0)
  return row ? pendingRequestSchema.parse(row).id : null
}

export { findLatestPendingJoinRequestId }
