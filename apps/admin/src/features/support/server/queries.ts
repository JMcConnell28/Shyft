import "@tanstack/react-start/server-only"

import { queryMany } from "@rocketrota/db"

import type { SupportPageData, SupportThread } from "@/features/support/types"

type ThreadRow = {
  category: string
  created_at: Date | string
  created_by_email: string | null
  id: string
  priority: string
  status: string
  subject: string
  updated_at: Date | string
}

async function listSupportThreads(): Promise<SupportPageData> {
  const rows = await queryMany<ThreadRow>(
    `select thread.id,
            thread.subject,
            thread.category,
            thread.priority,
            thread.status,
            thread.created_at,
            thread.updated_at,
            app_user.email as created_by_email
     from admin_private.support_threads thread
     left join public."user" app_user
       on app_user.id = thread.created_by_user_id
     order by thread.updated_at desc
     limit 200`,
  )

  return {
    threads: rows.map(mapThread),
  }
}

function mapThread(row: ThreadRow): SupportThread {
  return {
    category: row.category,
    createdAt: new Date(row.created_at).toISOString(),
    createdByEmail: row.created_by_email,
    id: row.id,
    priority: row.priority,
    status: row.status,
    subject: row.subject,
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

export { listSupportThreads }
