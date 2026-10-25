import { z } from "zod"
import {
  featureFlagModeLabels,
  featureFlagOverrideLabels,
} from "@rocketrota/shared/feature-flags"

const modeState = z.object({ mode: z.enum(["off", "selected", "all"]) })
const overrideState = z.object({
  override: z.union([
    z.boolean(),
    z.null(),
    z.enum(["inherit", "enabled", "disabled"]),
  ]),
})
const configurationState = z.object({
  isEnabled: z.boolean(),
  defaultValue: z.boolean(),
})
function describeFlagState(value: unknown): string {
  const mode = modeState.safeParse(value)
  if (mode.success) return featureFlagModeLabels[mode.data.mode]
  const target = overrideState.safeParse(value)
  if (target.success) {
    const setting = target.data.override
    return featureFlagOverrideLabels[
      setting === null
        ? "inherit"
        : typeof setting === "boolean"
          ? setting
            ? "enabled"
            : "disabled"
          : setting
    ]
  }
  const configuration = configurationState.safeParse(value)
  if (configuration.success)
    return featureFlagModeLabels[
      !configuration.data.isEnabled
        ? "off"
        : configuration.data.defaultValue
          ? "all"
          : "selected"
    ]
  return "Unknown previous setting"
}
export { describeFlagState }
