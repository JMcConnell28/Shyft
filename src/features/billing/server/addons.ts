import "@tanstack/react-start/server-only"

import {
  DERRY_CLOCK_STATION_COMING_SOON_MESSAGE,
  isDerryClockStationPostcode,
  normalizePostcode,
  type TimeAttendanceDeliveryAddress,
} from "@/features/billing/schemas/time-attendance-addon-schemas"
import { getLocationEntitlement } from "@/features/billing/server/entitlements"
import { syncBillingSubscriptionQuantities } from "@/features/billing/server/subscriptions"
import { getDatabase } from "@/lib/db"

type AddonBillingRow = {
  billing_account_id: string
  stripe_payment_method_id: string | null
  trial_ends_at: Date | string
  subscription_status: string | null
  current_period_end: Date | string | null
  hardware_entitlement_status: "available" | "claimed" | "void"
}

async function getAddonBilling(locationId: string) {
  const result = await getDatabase().query<AddonBillingRow>(
    `select
       location.billing_account_id,
       account.stripe_payment_method_id,
       entitlement.trial_ends_at,
       subscription.status as subscription_status,
       subscription.current_period_end
       ,hardware.entitlement_status as hardware_entitlement_status
     from public.locations location
     join public.billing_accounts account on account.id = location.billing_account_id
     join billing_private.location_entitlements entitlement on entitlement.location_id = location.id
     join billing_private.location_hardware_entitlements hardware on hardware.location_id = location.id
     left join lateral (
       select status, current_period_end
       from public.billing_subscriptions
       where billing_account_id = location.billing_account_id
       order by created_at desc
       limit 1
     ) subscription on true
     where location.id = $1`,
    [locationId]
  )
  const row = result.rows.at(0)

  if (!row)
    throw new Error("We could not load add-on billing for this location.")
  return row
}

async function activateTimeAttendance(input: {
  locationId: string
  confirmationAccepted: boolean
  deliveryAddress?: TimeAttendanceDeliveryAddress
}) {
  if (!input.confirmationAccepted) {
    throw new Error(
      "Confirm the Time & Attendance employee charge before activating Time & Attendance."
    )
  }

  const billing = await getAddonBilling(input.locationId)

  if (!billing.stripe_payment_method_id) {
    throw new Error(
      "Save a payment method before activating Time & Attendance."
    )
  }

  const requiresHardwareDelivery =
    billing.hardware_entitlement_status === "available"

  if (requiresHardwareDelivery && !input.deliveryAddress) {
    throw new Error("Enter a UK delivery address for the clock-in station.")
  }

  const deliveryAddress = input.deliveryAddress

  if (
    requiresHardwareDelivery &&
    deliveryAddress &&
    !isDerryClockStationPostcode(deliveryAddress.postcode)
  ) {
    throw new Error(DERRY_CLOCK_STATION_COMING_SOON_MESSAGE)
  }

  const trialEndsAt = new Date(billing.trial_ends_at)
  const isCoreTrial =
    trialEndsAt.getTime() > Date.now() &&
    billing.subscription_status !== "active"
  const status = isCoreTrial ? "trialing" : "active"

  await getDatabase().query(
    `insert into billing_private.location_addons (
       location_id, addon_type, status, activated_at, billing_starts_at
     ) values ($1, 'time_attendance', $2, timezone('utc', now()), $3)
     on conflict (location_id, addon_type)
     do update set status = excluded.status,
                   activated_at = coalesce(location_addons.activated_at, excluded.activated_at),
                   billing_starts_at = excluded.billing_starts_at,
                   cancel_at = null,
                   canceled_at = null,
                   legacy_opt_in_deadline = null,
                   updated_at = timezone('utc', now())`,
    [input.locationId, status, isCoreTrial ? trialEndsAt : new Date()]
  )

  if (requiresHardwareDelivery && deliveryAddress) {
    await getDatabase().query(
      `insert into billing_private.location_hardware_entitlements (
       location_id, entitlement_status, fulfillment_status, claimed_at,
       delivery_country, delivery_name, delivery_line1, delivery_line2,
       delivery_city, delivery_county, delivery_postcode
     ) values ($1, 'claimed', 'pending', timezone('utc', now()), $2, $3, $4, $5, $6, $7, $8)
     on conflict (location_id)
     do update set entitlement_status = 'claimed',
                   fulfillment_status = 'pending',
                   claimed_at = coalesce(location_hardware_entitlements.claimed_at, timezone('utc', now())),
                   delivery_country = excluded.delivery_country,
                   delivery_name = excluded.delivery_name,
                   delivery_line1 = excluded.delivery_line1,
                   delivery_line2 = excluded.delivery_line2,
                   delivery_city = excluded.delivery_city,
                   delivery_county = excluded.delivery_county,
                   delivery_postcode = excluded.delivery_postcode,
                   updated_at = timezone('utc', now())`,
      [
        input.locationId,
        deliveryAddress.country,
        deliveryAddress.name,
        deliveryAddress.line1,
        deliveryAddress.line2 ?? null,
        deliveryAddress.city,
        deliveryAddress.county ?? null,
        normalizePostcode(deliveryAddress.postcode),
      ]
    )
  }

  await syncBillingSubscriptionQuantities(billing.billing_account_id)
  return getLocationEntitlement(input.locationId)
}

async function cancelTimeAttendance(locationId: string) {
  const billing = await getAddonBilling(locationId)
  const cancelAt = billing.current_period_end
    ? new Date(billing.current_period_end)
    : new Date(billing.trial_ends_at)

  await getDatabase().query(
    `update billing_private.location_addons
     set status = 'canceling',
         cancel_at = $2,
         updated_at = timezone('utc', now())
     where location_id = $1
       and addon_type = 'time_attendance'
       and status in ('trialing', 'active', 'legacy_pending')`,
    [locationId, cancelAt]
  )

  return getLocationEntitlement(locationId)
}

async function keepTimeAttendance(locationId: string) {
  await getDatabase().query(
    `update billing_private.location_addons
     set status = case
           when billing_starts_at > timezone('utc', now()) then 'trialing'
           else 'active'
         end,
         cancel_at = null,
         canceled_at = null,
         updated_at = timezone('utc', now())
     where location_id = $1
       and addon_type = 'time_attendance'
       and status = 'canceling'`,
    [locationId]
  )

  return getLocationEntitlement(locationId)
}

async function processDueAddonCancellations(billingAccountId: string) {
  const result = await getDatabase().query<{ location_id: string }>(
    `update billing_private.location_addons addon
     set status = 'canceled',
         canceled_at = timezone('utc', now()),
         updated_at = timezone('utc', now())
     from public.locations location
     where location.id = addon.location_id
       and location.billing_account_id = $1
       and addon.status = 'canceling'
       and addon.cancel_at <= timezone('utc', now())
     returning addon.location_id`,
    [billingAccountId]
  )

  if (result.rowCount) {
    await syncBillingSubscriptionQuantities(billingAccountId)
  }
}

export {
  activateTimeAttendance,
  cancelTimeAttendance,
  keepTimeAttendance,
  processDueAddonCancellations,
}
