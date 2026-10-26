import "@tanstack/react-start/server-only"
import { z } from "zod"
import { getDatabase } from "@/lib/db"
import { buildAppUrl } from "@/lib/app-url.server"
import { sendTransactionalEmail } from "@/lib/email"

const notificationSchema = z.object({
  id: z.uuid(),
  request_id: z.uuid(),
  email: z.email(),
})
async function sendPersonalDataNotifications(): Promise<number> {
  const { rows } = await getDatabase().query(
    `with pending as (
       select e.id from privacy_private.data_request_events e
       join privacy_private.data_requests r on r.id = e.request_id
       join public."user" u on u.id = r.user_id
       where e.notify_user and e.email_sent_at is null and u."emailVerified"
         and e.next_email_attempt_at <= now()
         and (e.email_claimed_at is null or e.email_claimed_at < now() - interval '5 minutes')
       order by e.created_at limit 20 for update of e skip locked
     ), claimed as (
       update privacy_private.data_request_events e set email_claimed_at = now(), email_attempts = email_attempts + 1
       from pending where e.id = pending.id returning e.id, e.request_id
     ) select c.id, c.request_id, u.email from claimed c
       join privacy_private.data_requests r on r.id = c.request_id
       join public."user" u on u.id = r.user_id`
  )
  let sent = 0
  for (const value of rows) {
    const item = notificationSchema.parse(value)
    try {
      const url = buildAppUrl("/account/privacy")
      const text = `There is an update to your RocketRota personal data request ${item.request_id.slice(0, 8).toUpperCase()}. Sign in to review the status and any available response: ${url}. Your personal data is not attached to this email.`
      await sendTransactionalEmail({
        to: item.email,
        subject: "Your RocketRota personal data request",
        text,
        react: (
          <div>
            <p>There is an update to your personal data request.</p>
            <p>
              <a href={url}>Sign in to view your request</a>
            </p>
            <p>Your personal data is not attached to this email.</p>
          </div>
        ),
        idempotencyKey: `privacy-request-${item.id}`,
      })
      await getDatabase().query(
        "update privacy_private.data_request_events set email_sent_at = now(), email_claimed_at = null where id = $1",
        [item.id]
      )
      sent += 1
    } catch {
      // Do not log addresses, response content, credentials or provider error bodies.
      console.error("Personal data request notification failed", {
        eventId: item.id,
      })
      await getDatabase().query(
        `update privacy_private.data_request_events set email_claimed_at = null,
         next_email_attempt_at = now() + interval '15 minutes' where id = $1`,
        [item.id]
      )
    }
  }
  return sent
}
export { sendPersonalDataNotifications }
