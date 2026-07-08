import "@tanstack/react-start/server-only"

import { getDatabase } from "@/lib/db"

type FeatureFlagContext = {
  locationId?: string | null
  organizationId?: string | null
}

type FeatureFlagRow = {
  default_value: unknown
  is_enabled: boolean
  location_value: unknown | null
  organization_value: unknown | null
}

async function evaluateFeatureFlag(
  key: string,
  context: FeatureFlagContext = {},
): Promise<unknown> {
  const result = await getDatabase().query<FeatureFlagRow>(
    `select flag.is_enabled,
            flag.default_value,
            organization_target.value as organization_value,
            location_target.value as location_value
     from admin_private.feature_flags flag
     left join admin_private.feature_flag_targets organization_target
       on organization_target.feature_flag_id = flag.id
      and organization_target.target_type = 'organization'
      and organization_target.organization_id = $2
     left join admin_private.feature_flag_targets location_target
       on location_target.feature_flag_id = flag.id
      and location_target.target_type = 'location'
      and location_target.location_id = $3
     where flag.key = $1
     limit 1`,
    [key, context.organizationId ?? null, context.locationId ?? null],
  )
  const flag = result.rows.at(0)

  if (!flag?.is_enabled) {
    return false
  }

  return flag.location_value ?? flag.organization_value ?? flag.default_value
}

async function evaluateBooleanFeatureFlag(
  key: string,
  context: FeatureFlagContext = {},
) {
  return Boolean(await evaluateFeatureFlag(key, context))
}

export { evaluateBooleanFeatureFlag, evaluateFeatureFlag }
export type { FeatureFlagContext }
