import "@tanstack/react-start/server-only"

import { getDatabase } from "@/lib/db"
import { sendTransactionalEmail } from "@/lib/email"
import { getOptionalEnv } from "@/lib/env.server"

type StationAlertRow = {
  source: "included" | "additional"
  request_id: string
  location_id: string
  location_name: string
  customer_name: string
  customer_id: string
}

async function sendPendingStationAlerts(): Promise<void> {
  const database = getDatabase()
  await database.query(
    `insert into billing_private.station_admin_alerts (location_id, purchase_id)
     select location_id, purchase_id from billing_private.station_fulfillment_requests where needs_station
     on conflict (request_id) do nothing`
  )
  const { rows } = await database.query<StationAlertRow>(
    `with candidates as (
       select alert.request_id from billing_private.station_admin_alerts alert
       join billing_private.station_fulfillment_requests s on s.request_id = alert.request_id
       where s.needs_station and alert.email_sent_at is null
         and (alert.email_attempted_at is null or alert.email_attempted_at < now() - interval '5 minutes')
       order by alert.created_at limit 20 for update of alert skip locked
     )
     update billing_private.station_admin_alerts alert set email_attempted_at = now()
     from candidates
     join billing_private.station_fulfillment_requests s on s.request_id = candidates.request_id
     left join public.organization o on o.id = s.organization_id
     where alert.request_id = s.request_id
     returning s.source, s.request_id, s.location_id, s.location_name, coalesce(o.name, s.location_name) as customer_name,
       case when s.organization_id is null then 'account:' || s.billing_account_id::text else 'org:' || s.organization_id end as customer_id`
  )
  for (const row of rows) {
    try {
      const baseUrl = getOptionalEnv("ADMIN_BASE_URL")
      const url = baseUrl
        ? new URL(
            `/customers/${encodeURIComponent(row.customer_id)}`,
            baseUrl
          ).toString()
        : null
      const text = `A paid Time & Attendance customer needs a ${row.source === "additional" ? "purchased extra" : "included"} clock-in station: ${row.customer_name}, ${row.location_name}. Open the customer record in RocketRota Admin to prepare the NFC tag and arrange dispatch. Request: ${row.request_id}.${url ? ` ${url}` : ""}`
      await sendTransactionalEmail({
        to:
          getOptionalEnv("STATION_ALERT_EMAIL") ?? "jackmcconnell99@gmail.com",
        subject: `Clock-in station needed: ${row.customer_name} — ${row.location_name}`,
        text,
        react: (
          <div>
            <p>{text}</p>
            {url && <a href={url}>Open customer</a>}
          </div>
        ),
        idempotencyKey: `station-needed/${row.request_id}`,
      })
      await database.query(
        `update billing_private.station_admin_alerts set email_sent_at = now(), email_error = null where request_id = $1`,
        [row.request_id]
      )
    } catch (error) {
      await database.query(
        `update billing_private.station_admin_alerts set email_error = left($2, 1000) where request_id = $1`,
        [
          row.request_id,
          error instanceof Error ? error.message : "Email failed",
        ]
      )
      // Keep billing webhook processing independent of a mail outage. Pending
      // alerts retry on later webhooks and regular billing reconciliation.
      console.error("Station alert email failed for location", row.location_id)
    }
  }
}

export { sendPendingStationAlerts }
