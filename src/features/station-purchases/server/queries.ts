import "@tanstack/react-start/server-only"
import { getStationPrice } from "./price"
import type { StationPurchaseOptions } from "../types"
import { getLocationFeatureFlags } from "@/features/feature-flags/server/evaluation"
import { getDatabase } from "@/lib/db"

async function getPurchaseEligibility(
  locationId: string
): Promise<string | null> {
  if (!(await getLocationFeatureFlags(locationId)).station_purchases.enabled)
    return "Extra station purchases are currently unavailable for this location."
  const { rows } = await getDatabase().query<{ eligible: boolean }>(
    `select coalesce(subscription_status = 'active' and paid_at is not null and trial_ends_at <= now()
      and addon_status in ('active','trialing','canceling') and exists(
        select 1 from public.billing_subscriptions b where b.billing_account_id = s.billing_account_id
        and b.current_period_end > now() and b.id = (select id from public.billing_subscriptions where billing_account_id = s.billing_account_id order by created_at desc, id desc limit 1)
      ) and exists(select 1 from billing_private.location_addons a where a.location_id = s.location_id
        and a.addon_type = 'time_attendance' and (a.cancel_at is null or a.cancel_at > now())), false) as eligible
     from billing_private.clock_station_fulfillment s where location_id = $1`,
    [locationId]
  )
  if (!rows.at(0)?.eligible)
    return "Additional stations are available once your trial has ended and your paid Time & Attendance subscription is active."
  return null
}

async function getPurchaseOptions(
  locationId: string
): Promise<StationPurchaseOptions> {
  const [price, reason, result] = await Promise.all([
    getStationPrice(),
    getPurchaseEligibility(locationId),
    getDatabase().query<{
      id: string
      payment_status: string
      fulfillment_status: string
      created_at: Date
      unit_amount: number
      currency: string
      is_live: boolean
    }>(
      `select id, payment_status, fulfillment_status, created_at, unit_amount, currency, is_live
       from billing_private.clock_station_purchases where location_id = $1 order by created_at desc limit 50`,
      [locationId]
    ),
  ])
  return {
    canPurchase: Boolean(price && !reason),
    reason:
      reason ??
      (!price ? "Extra station checkout has not been enabled yet." : null),
    unitAmount: price?.unit_amount ?? null,
    currency: price?.currency ?? "gbp",
    purchases: result.rows.map((row) => ({
      id: row.id,
      paymentStatus: row.payment_status,
      fulfillmentStatus: row.fulfillment_status,
      createdAt: row.created_at.toISOString(),
      amount: row.unit_amount,
      currency: row.currency,
      isLive: row.is_live,
    })),
  }
}
export { getPurchaseEligibility, getPurchaseOptions, getStationPrice }
