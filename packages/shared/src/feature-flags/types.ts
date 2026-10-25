import type { featureFlagDefinitions } from "./index"

type FeatureFlagKey = (typeof featureFlagDefinitions)[number]["key"]
type FeatureFlagMode = "off" | "selected" | "all"
type FeatureFlagOverride = "inherit" | "enabled" | "disabled"
type FeatureFlagResolution = {
  enabled: boolean
  source: "global_off" | "location" | "global" | "default"
}
type LocationFeatureFlags = Record<FeatureFlagKey, FeatureFlagResolution>

export type {
  FeatureFlagKey,
  FeatureFlagMode,
  FeatureFlagOverride,
  FeatureFlagResolution,
  LocationFeatureFlags,
}
