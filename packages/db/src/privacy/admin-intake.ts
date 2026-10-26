import "@tanstack/react-start/server-only"
import { z } from "zod"
import { recordPrivacyRequestSchema } from "@rocketrota/shared/privacy"
import { withPrivacyTransaction } from "./transaction"

async function recordManualPrivacyRequest(
  raw: z.infer<typeof recordPrivacyRequestSchema>,
  adminUserId: string
): Promise<string> {
  const input = recordPrivacyRequestSchema.parse(raw)
  return withPrivacyTransaction(async (client) => {
    if (input.userId) {
      const user = await client.query(
        'select id from public."user" where id = $1 and lower(email) = lower($2)',
        [input.userId, input.email]
      )
      if (!user.rows[0])
        throw new Error(
          "The linked account must match the verified email. Otherwise leave the account link empty and arrange secure external delivery."
        )
    }
    const { rows } = await client.query(
      `insert into privacy_private.data_requests(user_id, subject_name, subject_email, requested_at, due_at, original_due_at)
       values ($1, $2, $3, $4, $4::timestamptz + interval '1 month', $4::timestamptz + interval '1 month')
       on conflict (user_id) where user_id is not null and status in ('requested','in_review','awaiting_workplace')
       do update set requested_at = least(privacy_private.data_requests.requested_at, excluded.requested_at),
         due_at = least(privacy_private.data_requests.due_at, excluded.due_at),
         original_due_at = least(privacy_private.data_requests.original_due_at, excluded.original_due_at),
         revision = privacy_private.data_requests.revision + 1 returning id`,
      [input.userId ?? null, input.name, input.email, input.receivedAt]
    )
    const id = z.uuid().parse(rows[0]?.id)
    await client.query(
      `insert into privacy_private.data_request_events(request_id, admin_user_id, kind, internal_note, public_message, notify_user)
       values ($1, $2, 'requested', $3, 'Your personal data request has been recorded.', $4)`,
      [id, adminUserId, input.note, Boolean(input.userId)]
    )
    return id
  })
}
export { recordManualPrivacyRequest }
