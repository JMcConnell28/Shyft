import "@tanstack/react-start/server-only"

import { getDatabase } from "@rocketrota/db"

import { writeAdminAuditLog } from "@/features/audit/server/audit-log"

async function extendLocationTrial(input: {
  adminUserId: string
  days: number
  locationId: string
  reason: string
}) {
  const result = await getDatabase().query<{
    location_id: string
    trial_ends_at: Date | string
  }>(
    `update billing_private.location_entitlements
     set trial_ends_at = greatest(trial_ends_at, timezone('utc', now())) + ($2::integer * interval '1 day'),
         updated_at = timezone('utc', now())
     where location_id = $1
     returning location_id, trial_ends_at`,
    [input.locationId, input.days],
  )
  const entitlement = result.rows.at(0)

  if (!entitlement) {
    throw new Error("Choose a valid location entitlement.")
  }

  await writeAdminAuditLog({
    action: "billing.trial_extended",
    adminUserId: input.adminUserId,
    afterState: {
      days: input.days,
      reason: input.reason,
      trialEndsAt: new Date(entitlement.trial_ends_at).toISOString(),
    },
    permission: "billing.trials.update",
    targetId: input.locationId,
    targetType: "location",
  })

  return {
    locationId: entitlement.location_id,
    trialEndsAt: new Date(entitlement.trial_ends_at).toISOString(),
  }
}

export { extendLocationTrial }
