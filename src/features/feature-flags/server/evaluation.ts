import "@tanstack/react-start/server-only"
import {
  featureFlagDefinitions,
  getDefaultFeatureFlags,
  resolveFeatureFlag,
} from "@rocketrota/shared/feature-flags"
import { featureFlagRowSchema } from "../schemas"
import type {
  FeatureFlagKey,
  LocationFeatureFlags,
} from "@rocketrota/shared/feature-flags/types"
import { getDatabase } from "@/lib/db"

const CACHE_MS = 10000
const MAX_CACHE_ENTRIES = 1000
type CacheEntry = {
  expiresAt: number
  value: LocationFeatureFlags
  pending?: Promise<LocationFeatureFlags>
}
const cache = new Map<string, CacheEntry>()

async function getLocationFeatureFlags(
  locationId: string
): Promise<LocationFeatureFlags> {
  const previous = cache.get(locationId)
  if (previous?.pending) return previous.pending
  if (previous && previous.expiresAt > Date.now()) return previous.value
  const entry: CacheEntry = {
    expiresAt: 0,
    value: previous?.value ?? getDefaultFeatureFlags(),
  }
  const pending = readLocationFlags(locationId)
    .then((value) => {
      entry.value = value
      entry.expiresAt = Date.now() + CACHE_MS
      return value
    })
    .catch((error: unknown) => {
      console.error("Feature flag refresh failed", error)
      entry.expiresAt = Date.now() + 5000
      return entry.value
    })
    .finally(() => {
      delete entry.pending
    })
  entry.pending = pending
  if (!previous && cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value
    if (oldestKey) cache.delete(oldestKey)
  }
  cache.set(locationId, entry)
  return pending
}

async function readLocationFlags(
  locationId: string
): Promise<LocationFeatureFlags> {
  const result = await getDatabase().query(
    `select f.key, f.is_enabled, f.default_value, t.value as location_value from admin_private.feature_flags f
     left join admin_private.feature_flag_targets t on t.feature_flag_id = f.id and t.target_type = 'location' and t.location_id = $1
     where f.key = any($2::text[])`,
    [locationId, featureFlagDefinitions.map((flag) => flag.key)]
  )
  const flags = getDefaultFeatureFlags()
  for (const raw of result.rows) {
    const row = featureFlagRowSchema.parse(raw)
    flags[row.key] = resolveFeatureFlag(flags[row.key].enabled, {
      isEnabled: row.is_enabled,
      defaultValue: row.default_value,
      locationValue: row.location_value,
    })
  }
  return flags
}
async function requireLocationFeature(
  key: FeatureFlagKey,
  locationId: string
): Promise<void> {
  if (!(await getLocationFeatureFlags(locationId))[key].enabled) {
    const name =
      featureFlagDefinitions.find((flag) => flag.key === key)?.name ?? key
    throw new Error(`${name} is currently unavailable for this location.`)
  }
}
export { getLocationFeatureFlags, requireLocationFeature }
