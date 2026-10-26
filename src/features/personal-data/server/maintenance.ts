import "@tanstack/react-start/server-only"
import { getDatabase } from "@/lib/db"

async function expirePersonalDataResponses(): Promise<void> {
  await getDatabase().query(
    `with expired as (
      update privacy_private.data_requests set status = 'expired', released_response = null,
        revision = revision + 1,
        public_message = 'This download has expired. Contact us for another copy, or submit a new request.'
      where status = 'ready' and expires_at <= now() returning id
    ) insert into privacy_private.data_request_events(request_id, kind, public_message)
      select id, 'expired', 'The download expired. Contact us if you need another copy.' from expired`
  )
  await getDatabase().query(
    `update privacy_private.data_requests set draft = null, draft_expires_at = null, revision = revision + 1
     where draft is not null and draft_expires_at <= now()`
  )
}
export { expirePersonalDataResponses }
