import "@tanstack/react-start/server-only"
import { z } from "zod"
import { personalDataResponseSchema } from "@rocketrota/shared/privacy"
import { getDatabase } from "../index"
import { mapPrivacyRequest, requestColumns } from "./rows"
import { withPrivacyTransaction } from "./transaction"
import type {
  PersonalDataResponse,
  PrivacyRequestSummary,
} from "@rocketrota/shared/privacy"

async function listPersonalDataRequests(
  userId: string
): Promise<Array<PrivacyRequestSummary>> {
  const { rows } = await getDatabase().query(
    `select ${requestColumns} from privacy_private.data_requests
     where user_id = $1 order by requested_at desc limit 25`,
    [userId]
  )
  return rows.map(mapPrivacyRequest)
}

async function createPersonalDataRequest(
  userId: string
): Promise<PrivacyRequestSummary> {
  return withPrivacyTransaction(async (client) => {
    const inserted = await client.query(
      `insert into privacy_private.data_requests(user_id, subject_name, subject_email)
       select id, name, email from public."user" where id = $1 and "emailVerified"
       on conflict (user_id) where user_id is not null and status in ('requested','in_review','awaiting_workplace')
       do nothing returning ${requestColumns}`,
      [userId]
    )
    const row = inserted.rows[0]
    if (row) {
      const request = mapPrivacyRequest(row)
      await client.query(
        `insert into privacy_private.data_request_events(request_id, kind, public_message, notify_user)
         values ($1, 'requested', 'Your personal data request has been received.', true)`,
        [request.id]
      )
      return request
    }
    const existing = await client.query(
      `select ${requestColumns} from privacy_private.data_requests
       where user_id = $1 and status in ('requested','in_review','awaiting_workplace')`,
      [userId]
    )
    if (!existing.rows[0]) throw new Error("Verify your email and try again.")
    return mapPrivacyRequest(existing.rows[0])
  })
}

async function readReleasedPersonalDataResponse(
  id: string,
  userId: string
): Promise<PersonalDataResponse> {
  return withPrivacyTransaction(async (client) => {
    const result = await client.query(
      `select released_response from privacy_private.data_requests
       where id = $1 and user_id = $2 and status = 'ready' and expires_at > now()
       for update`,
      [id, userId]
    )
    if (!result.rows[0])
      throw new Error("This download is unavailable or has expired.")
    const response = personalDataResponseSchema.parse(
      result.rows[0].released_response
    )
    if (response.subject.userId !== userId || response.requestId !== id) {
      throw new Error("This response does not belong to your account.")
    }
    await client.query(
      "update privacy_private.data_requests set downloaded_at = now() where id = $1",
      [id]
    )
    await client.query(
      `insert into privacy_private.data_request_events(request_id, kind)
       values ($1, 'downloaded')`,
      [id]
    )
    return response
  })
}

const eventSchema = z.object({
  id: z.uuid(),
  public_message: z.string(),
  created_at: z.coerce.date(),
})
async function listPersonalDataEvents(userId: string) {
  const { rows } = await getDatabase().query(
    `select e.id, e.public_message, e.created_at from privacy_private.data_request_events e
     join privacy_private.data_requests r on r.id = e.request_id
     where r.user_id = $1 and e.public_message <> '' order by e.created_at desc limit 50`,
    [userId]
  )
  return rows.map((value) => {
    const row = eventSchema.parse(value)
    return {
      id: row.id,
      message: row.public_message,
      createdAt: row.created_at.toISOString(),
    }
  })
}
export {
  createPersonalDataRequest,
  listPersonalDataEvents,
  listPersonalDataRequests,
  readReleasedPersonalDataResponse,
}
