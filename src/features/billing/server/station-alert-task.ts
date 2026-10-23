import { defineTask } from "nitro/task"
import { reconcileStationPayments } from "./station-payments"
import { sendPendingStationAlerts } from "./station-alerts"
import { reconcileStationCheckouts } from "@/features/station-purchases/server/payments"
import { getDatabase } from "@/lib/db"

export default defineTask({
  meta: {
    name: "billing:station-alerts",
    description:
      "Recover paid station requests and retry internal operator alerts.",
  },
  async run() {
    const { rows } = await getDatabase().query<{ stripe_customer_id: string }>(
      `select distinct a.stripe_customer_id
       from billing_private.clock_station_fulfillment s
       join public.billing_accounts a on a.id = s.billing_account_id
       where s.entitlement_status = 'claimed' and s.fulfillment_status not in ('shipped', 'delivered')
         and s.subscription_status is distinct from 'canceled' and s.addon_status in ('active', 'trialing', 'canceling')
         and s.trial_ends_at <= now() and s.paid_at is null and a.stripe_customer_id is not null`
    )
    for (const row of rows) {
      try {
        await reconcileStationPayments(row.stripe_customer_id)
      } catch (error) {
        console.error("Station payment recovery failed", error)
      }
    }
    await reconcileStationCheckouts()
    await sendPendingStationAlerts()
    return { result: { checkedAccounts: rows.length } }
  },
})
