import "@tanstack/react-start/server-only"

import { PAST_DUE_GRACE_DAYS } from "@/features/billing/constants"
import type { LocationEntitlement } from "@/features/billing/types"
import { getDatabase } from "@/lib/db"

type LocationEntitlementRow = {
  location_id: string
  billing_account_id: string
  trial_ends_at: Date | string
  subscription_status: string | null
  current_period_end: Date | string | null
  past_due_started_at: Date | string | null
  addon_status:
    | "legacy_pending"
    | "trialing"
    | "active"
    | "canceling"
    | "canceled"
    | null
  addon_billing_starts_at: Date | string | null
  addon_cancel_at: Date | string | null
  legacy_opt_in_deadline: Date | string | null
  transfer_id: string | null
  source_billing_account_id: string | null
  target_billing_account_id: string | null
  transfer_status:
    | "scheduled"
    | "ready"
    | "completed"
    | "failed"
    | "canceled"
    | null
  transfer_effective_at: Date | string | null
}

function toIso(value: Date | string | null) {
  return value ? new Date(value).toISOString() : null
}

function addGraceDays(value: Date | string | null) {
  if (!value) return null
  const graceEnd = new Date(value)
  graceEnd.setUTCDate(graceEnd.getUTCDate() + PAST_DUE_GRACE_DAYS)
  return graceEnd
}

function mapLocationEntitlement(
  row: LocationEntitlementRow
): LocationEntitlement {
  const now = Date.now()
  const trialEndsAt = new Date(row.trial_ends_at)
  const graceEndsAt = addGraceDays(row.past_due_started_at)
  const isPaid =
    row.subscription_status === "active" ||
    row.subscription_status === "trialing"
  const isGrace =
    row.subscription_status === "past_due" &&
    Boolean(graceEndsAt && graceEndsAt.getTime() > now)
  const accessState = isPaid
    ? "active"
    : isGrace
      ? "grace"
      : trialEndsAt.getTime() > now
        ? "trial"
        : "recovery"
  const addon = row.addon_status
    ? {
        type: "time_attendance" as const,
        status: row.addon_status,
        billingStartsAt: toIso(row.addon_billing_starts_at),
        cancelAt: toIso(row.addon_cancel_at),
        legacyOptInDeadline: toIso(row.legacy_opt_in_deadline),
      }
    : null
  const pendingTransfer =
    row.transfer_id &&
    row.source_billing_account_id &&
    row.target_billing_account_id &&
    row.transfer_status &&
    row.transfer_effective_at
      ? {
          id: row.transfer_id,
          sourceBillingAccountId: row.source_billing_account_id,
          targetBillingAccountId: row.target_billing_account_id,
          status: row.transfer_status,
          effectiveAt: new Date(row.transfer_effective_at).toISOString(),
        }
      : null
  const addonEnabled =
    addon?.status === "active" ||
    addon?.status === "trialing" ||
    addon?.status === "canceling"

  return {
    locationId: row.location_id,
    billingAccountId: row.billing_account_id,
    accessState,
    canWrite: accessState !== "recovery",
    trialEndsAt: trialEndsAt.toISOString(),
    renewalDate: toIso(row.current_period_end),
    addon,
    pendingTransfer,
    timeAttendanceEnabled: accessState !== "recovery" && addonEnabled,
  }
}

async function getLocationEntitlement(locationId: string) {
  const result = await getDatabase().query<LocationEntitlementRow>(
    `select
       location.id as location_id,
       location.billing_account_id,
       entitlement.trial_ends_at,
       subscription.status as subscription_status,
       subscription.current_period_end,
       subscription.past_due_started_at,
       addon.status as addon_status,
       addon.billing_starts_at as addon_billing_starts_at,
       addon.cancel_at as addon_cancel_at,
       addon.legacy_opt_in_deadline,
       transfer.id as transfer_id,
       transfer.source_billing_account_id,
       transfer.target_billing_account_id,
       transfer.status as transfer_status,
       transfer.effective_at as transfer_effective_at
     from public.locations location
     join billing_private.location_entitlements entitlement
       on entitlement.location_id = location.id
     left join lateral (
       select status, current_period_end, past_due_started_at
       from public.billing_subscriptions
       where billing_account_id = location.billing_account_id
       order by created_at desc
       limit 1
     ) subscription on true
     left join billing_private.location_addons addon
       on addon.location_id = location.id
      and addon.addon_type = 'time_attendance'
     left join lateral (
       select *
       from billing_private.billing_transfers
       where location_id = location.id
         and status in ('scheduled', 'ready')
       order by created_at desc
       limit 1
     ) transfer on true
     where location.id = $1`,
    [locationId]
  )
  const row = result.rows.at(0)

  if (!row)
    throw new Error("We could not load billing access for this location.")
  return mapLocationEntitlement(row)
}

async function requireLocationPaidWriteAccess(locationId: string) {
  const entitlement = await getLocationEntitlement(locationId)

  if (!entitlement.canWrite) {
    throw new Error(
      "This location is in recovery mode. Update billing to make changes."
    )
  }

  return entitlement
}

async function requireTimeAttendanceAccess(locationId: string) {
  const entitlement = await requireLocationPaidWriteAccess(locationId)

  if (!entitlement.timeAttendanceEnabled) {
    throw new Error("Time & Attendance is not enabled for this location.")
  }

  return entitlement
}

export {
  getLocationEntitlement,
  requireLocationPaidWriteAccess,
  requireTimeAttendanceAccess,
}
