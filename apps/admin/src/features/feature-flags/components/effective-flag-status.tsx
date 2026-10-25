import type { FeatureFlagResolution } from "@rocketrota/shared/feature-flags/types"

const sources = {
  global_off: "off everywhere",
  location: "location override",
  global: "global setting",
  default: "default setting",
}
function EffectiveFlagStatus({ value }: { value: FeatureFlagResolution }) {
  return (
    <p
      className={`text-xs ${value.enabled ? "text-emerald-700" : "text-slate-600"}`}
    >
      {value.enabled ? "Enabled" : "Disabled"} · {sources[value.source]}
    </p>
  )
}
export { EffectiveFlagStatus }
