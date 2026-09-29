import "@tanstack/react-start/server-only"

import { getDatabase, queryMany, queryOne } from "@rocketrota/db"

import type {
  SupportMessage,
  SupportPageData,
  SupportThread,
  SupportThreadDetail,
} from "@/features/support/types"

type ThreadRow = {
  category: string
  created_at: Date | string
  created_by_email: string | null
  id: string
  priority: string
  status: string
  subject: string
  updated_at: Date | string
  unread: boolean
}

type MessageRow = {
  id: string
  author_type: SupportMessage["authorType"]
  body: string
  created_at: Date | string
  message_number: string
}

async function listSupportThreads(
  adminUserId: string,
  page: number
): Promise<SupportPageData> {
  const rows = await queryMany<ThreadRow>(
    `select thread.id,
            thread.subject,
            thread.category,
            thread.priority,
            thread.status,
            thread.created_at,
            thread.updated_at,
            app_user.email as created_by_email,
            coalesce((select max(message_number)
                      from admin_private.support_messages message
                      where message.thread_id = thread.id
                        and message.author_type = 'user'), 0)
              > coalesce(read_state.last_read_message_number, 0) as unread
     from admin_private.support_threads thread
     left join public."user" app_user
       on app_user.id = thread.created_by_user_id
     left join admin_private.support_thread_reads read_state
       on read_state.thread_id = thread.id
      and read_state.reader_kind = 'admin'
      and read_state.reader_id = $1
     order by thread.updated_at desc, thread.id desc
     limit 26 offset $2`,
    [adminUserId, page * 25]
  )

  return {
    threads: rows.slice(0, 25).map(mapThread),
    hasMore: rows.length > 25,
  }
}

async function getSupportThreadDetail(
  id: string,
  adminUserId: string
): Promise<SupportThreadDetail> {
  const threads = await queryMany<ThreadRow>(
    `select thread.id, thread.subject, thread.category, thread.priority,
            thread.status, thread.created_at, thread.updated_at,
            app_user.email as created_by_email, false as unread
     from admin_private.support_threads thread
     left join public."user" app_user
       on app_user.id = thread.created_by_user_id
     where thread.id = $1`,
    [id]
  )
  const thread = threads[0]
  if (!thread) throw new Error("We could not find that support request.")
  const messages = await queryMany<MessageRow>(
    `select id, author_type, body, created_at, message_number
     from admin_private.support_messages
     where thread_id = $1 and not is_internal_note
     order by message_number asc`,
    [id]
  )
  const lastMessage = messages.at(-1)
  if (lastMessage) {
    await getDatabase().query(
      `insert into admin_private.support_thread_reads
         (thread_id, reader_kind, reader_id, last_read_message_number)
       values ($1, 'admin', $2, $3)
       on conflict (thread_id, reader_kind, reader_id)
       do update set last_read_message_number = greatest(
         admin_private.support_thread_reads.last_read_message_number,
         excluded.last_read_message_number
       )`,
      [id, adminUserId, lastMessage.message_number]
    )
  }
  return {
    ...mapThread(thread),
    messages: messages.map((message) => ({
      id: message.id,
      authorType: message.author_type,
      body: message.body,
      createdAt: new Date(message.created_at).toISOString(),
    })),
  }
}

async function countUnreadSupportThreads(adminUserId: string): Promise<number> {
  const row = await queryOne<{ unread_count: string }>(
    `select count(*) as unread_count
     from admin_private.support_threads thread
     left join admin_private.support_thread_reads read_state
       on read_state.thread_id = thread.id
      and read_state.reader_kind = 'admin'
      and read_state.reader_id = $1
     where exists (
       select 1 from admin_private.support_messages message
       where message.thread_id = thread.id
         and message.author_type = 'user'
         and message.message_number > coalesce(read_state.last_read_message_number, 0)
     )`,
    [adminUserId]
  )
  return Number(row?.unread_count ?? 0)
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
    unread: row.unread,
  }
}

export { countUnreadSupportThreads, getSupportThreadDetail, listSupportThreads }
