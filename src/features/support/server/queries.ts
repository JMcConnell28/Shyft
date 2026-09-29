import "@tanstack/react-start/server-only"

import type {
  SupportCategory,
  SupportMessage,
  SupportNotifications,
  SupportStatus,
  SupportThreadDetail,
  SupportThreadPageData,
  SupportThreadSummary,
} from "@/features/support/types"
import { getDatabase } from "@/lib/db"

type ThreadRow = {
  id: string
  subject: string
  category: SupportCategory
  status: SupportStatus
  updated_at: Date
  unread: boolean
}

type MessageRow = {
  id: string
  author_type: SupportMessage["authorType"]
  body: string
  created_at: Date
  message_number: string
}

function mapThread(row: ThreadRow): SupportThreadSummary {
  return {
    id: row.id,
    subject: row.subject,
    category: row.category,
    status: row.status,
    updatedAt: row.updated_at.toISOString(),
    unread: row.unread,
  }
}

async function listCustomerSupportThreads(input: {
  organizationId: string
  userId: string
  page: number
}): Promise<SupportThreadPageData> {
  const result = await getDatabase().query<ThreadRow>(
    `select thread.id, thread.subject, thread.category, thread.status,
            thread.updated_at,
            coalesce((select max(message_number)
                      from admin_private.support_messages message
                      where message.thread_id = thread.id
                        and message.author_type in ('admin', 'system')
                        and not message.is_internal_note), 0)
              > coalesce(read_state.last_read_message_number, 0) as unread
     from admin_private.support_threads thread
     left join admin_private.support_thread_reads read_state
       on read_state.thread_id = thread.id
      and read_state.reader_kind = 'user'
      and read_state.reader_id = $2
     where thread.organization_id = $1 and thread.created_by_user_id = $2
     order by thread.updated_at desc, thread.id desc
     limit 26 offset $3`,
    [input.organizationId, input.userId, input.page * 25]
  )
  return {
    threads: result.rows.slice(0, 25).map(mapThread),
    hasMore: result.rows.length > 25,
  }
}

async function getCustomerSupportThread(input: {
  organizationId: string
  threadId: string
  userId: string
}): Promise<SupportThreadDetail> {
  const database = getDatabase()
  const thread = await database.query<ThreadRow>(
    `select id, subject, category, status, updated_at, false as unread
     from admin_private.support_threads
     where id = $1 and organization_id = $2 and created_by_user_id = $3`,
    [input.threadId, input.organizationId, input.userId]
  )
  const row = thread.rows.at(0)
  if (!row) throw new Error("We could not find that support request.")

  const messages = await database.query<MessageRow>(
    `select id, author_type, body, created_at, message_number
     from admin_private.support_messages
     where thread_id = $1 and not is_internal_note
     order by message_number asc`,
    [input.threadId]
  )
  const lastMessage = messages.rows.at(-1)
  if (lastMessage) {
    await database.query(
      `insert into admin_private.support_thread_reads
         (thread_id, reader_kind, reader_id, last_read_message_number)
       values ($1, 'user', $2, $3)
       on conflict (thread_id, reader_kind, reader_id)
       do update set last_read_message_number = greatest(
         admin_private.support_thread_reads.last_read_message_number,
         excluded.last_read_message_number
       )`,
      [input.threadId, input.userId, lastMessage.message_number]
    )
  }
  return {
    ...mapThread(row),
    messages: messages.rows.map((message) => ({
      id: message.id,
      authorType: message.author_type,
      body: message.body,
      createdAt: message.created_at.toISOString(),
    })),
  }
}

async function listCustomerSupportNotifications(input: {
  organizationId: string
  userId: string
}): Promise<SupportNotifications> {
  const result = await getDatabase().query<
    ThreadRow & { unread_count: string }
  >(
    `select thread.id, thread.subject, thread.category, thread.status,
            thread.updated_at, true as unread, count(*) over() as unread_count
     from admin_private.support_threads thread
     left join admin_private.support_thread_reads read_state
       on read_state.thread_id = thread.id
      and read_state.reader_kind = 'user'
      and read_state.reader_id = $2
     where thread.organization_id = $1 and thread.created_by_user_id = $2
       and exists (
         select 1 from admin_private.support_messages message
         where message.thread_id = thread.id
           and message.author_type in ('admin', 'system')
           and not message.is_internal_note
           and message.message_number > coalesce(read_state.last_read_message_number, 0)
       )
     order by thread.updated_at desc
     limit 5`,
    [input.organizationId, input.userId]
  )
  return {
    threads: result.rows.map(mapThread),
    unreadCount: Number(result.rows.at(0)?.unread_count ?? 0),
  }
}

export {
  getCustomerSupportThread,
  listCustomerSupportNotifications,
  listCustomerSupportThreads,
}
