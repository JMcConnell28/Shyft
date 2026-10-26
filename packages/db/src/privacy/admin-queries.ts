import "@tanstack/react-start/server-only"
import { z } from "zod"
import { personalDataResponseSchema } from "@rocketrota/shared/privacy"
import { getDatabase } from "../index"
import { mapPrivacyRequest, requestColumns } from "./rows"
import type {
  PrivacyAdminDetail,
  PrivacyAdminSummary,
} from "@rocketrota/shared/privacy"

const subjectSchema = z.object({
  subject_name: z.string(),
  subject_email: z.email(),
})
function mapAdminRequest(value: unknown): PrivacyAdminSummary {
  const row = subjectSchema.parse(value)
  return {
    ...mapPrivacyRequest(value),
    subjectName: row.subject_name,
    subjectEmail: row.subject_email,
  }
}
async function listPrivacyAdminRequests(page: number) {
  const { rows } = await getDatabase().query(
    `select ${requestColumns}, subject_name, subject_email from privacy_private.data_requests
     order by (status in ('requested','in_review','awaiting_workplace')) desc, due_at, id
     limit 26 offset $1`,
    [page * 25]
  )
  return {
    requests: rows.slice(0, 25).map(mapAdminRequest),
    hasMore: rows.length > 25,
  }
}
const detailSchema = z.object({
  user_id: z.string().nullable(),
  draft: z.unknown(),
})
const eventSchema = z.object({
  id: z.uuid(),
  public_message: z.string(),
  internal_note: z.string(),
  created_at: z.coerce.date(),
})
async function getPrivacyAdminDetail(id: string): Promise<PrivacyAdminDetail> {
  const { rows } = await getDatabase().query(
    `select ${requestColumns}, subject_name, subject_email, user_id,
       case when draft_expires_at > now() then draft else null end as draft
     from privacy_private.data_requests where id = $1`,
    [id]
  )
  if (!rows[0]) throw new Error("This request could not be found.")
  const row = detailSchema.parse(rows[0])
  const events = await getDatabase().query(
    `select id, public_message, internal_note, created_at from privacy_private.data_request_events
     where request_id = $1 order by created_at desc`,
    [id]
  )
  return {
    request: mapAdminRequest(rows[0]),
    subjectUserId: row.user_id,
    draft: row.draft ? personalDataResponseSchema.parse(row.draft) : null,
    events: events.rows.map((value) => {
      const event = eventSchema.parse(value)
      return {
        id: event.id,
        message: event.public_message,
        internalNote: event.internal_note,
        createdAt: event.created_at.toISOString(),
      }
    }),
  }
}
export { getPrivacyAdminDetail, listPrivacyAdminRequests }
