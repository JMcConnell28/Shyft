import "@tanstack/react-start/server-only"

import { getDatabase } from "@rocketrota/db"

import { writeAdminAuditLog } from "@/features/audit/server/audit-log"
import type { FeatureFlagValue } from "@/features/feature-flags/types"

async function createFeatureFlag(input: {
  adminUserId: string
  defaultValue: FeatureFlagValue
  description?: string
  key: string
  name: string
}) {
  const result = await getDatabase().query<{ id: string }>(
    `insert into admin_private.feature_flags (
       key,
       name,
       description,
       default_value,
       created_by_admin_user_id,
       updated_by_admin_user_id
     ) values ($1, $2, $3, $4, $5, $5)
     returning id`,
    [
      input.key,
      input.name,
      input.description ?? null,
      JSON.stringify(input.defaultValue),
      input.adminUserId,
    ],
  )
  const flag = result.rows.at(0)

  if (!flag) {
    throw new Error("We could not create that feature flag.")
  }

  await writeAdminAuditLog({
    action: "feature_flag.created",
    adminUserId: input.adminUserId,
    afterState: input,
    permission: "feature_flags.manage",
    targetId: flag.id,
    targetType: "feature_flag",
  })

  return flag
}

async function updateFeatureFlag(input: {
  adminUserId: string
  defaultValue?: FeatureFlagValue
  description?: string | null
  id: string
  isEnabled?: boolean
  name?: string
}) {
  const result = await getDatabase().query<{ id: string }>(
    `update admin_private.feature_flags
     set name = coalesce($2, name),
         description = case when $3::boolean then $4 else description end,
         is_enabled = coalesce($5, is_enabled),
         default_value = coalesce($6, default_value),
         updated_by_admin_user_id = $7,
         updated_at = timezone('utc', now())
     where id = $1
     returning id`,
    [
      input.id,
      input.name ?? null,
      Object.prototype.hasOwnProperty.call(input, "description"),
      input.description ?? null,
      input.isEnabled ?? null,
      input.defaultValue === undefined ? null : JSON.stringify(input.defaultValue),
      input.adminUserId,
    ],
  )
  const flag = result.rows.at(0)

  if (!flag) {
    throw new Error("Choose a valid feature flag.")
  }

  await writeAdminAuditLog({
    action: "feature_flag.updated",
    adminUserId: input.adminUserId,
    afterState: input,
    permission: "feature_flags.manage",
    targetId: input.id,
    targetType: "feature_flag",
  })

  return flag
}

export { createFeatureFlag, updateFeatureFlag }
