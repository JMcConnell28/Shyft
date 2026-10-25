import { describe, expect, it } from "vitest"
import {
  featureFlagDefinitions,
  getDefaultFeatureFlags,
  resolveFeatureFlag,
} from "./index"

describe("feature flag precedence", () => {
  it("keeps established features enabled before configuration exists", () => {
    expect(Object.keys(getDefaultFeatureFlags()).sort()).toEqual(
      featureFlagDefinitions.map((flag) => flag.key).sort()
    )
    expect(resolveFeatureFlag(true)).toEqual({
      enabled: true,
      source: "default",
    })
    expect(resolveFeatureFlag(false)).toEqual({
      enabled: false,
      source: "default",
    })
  })
  it("off everywhere wins over an explicit location enable", () => {
    expect(
      resolveFeatureFlag(true, {
        isEnabled: false,
        defaultValue: true,
        locationValue: true,
      })
    ).toEqual({ enabled: false, source: "global_off" })
  })
  it("selected mode requires a location enable", () => {
    expect(
      resolveFeatureFlag(true, { isEnabled: true, defaultValue: false }).enabled
    ).toBe(false)
    expect(
      resolveFeatureFlag(true, {
        isEnabled: true,
        defaultValue: false,
        locationValue: true,
      })
    ).toEqual({ enabled: true, source: "location" })
  })
  it("allows location exclusions in all-locations mode", () => {
    expect(
      resolveFeatureFlag(true, {
        isEnabled: true,
        defaultValue: true,
        locationValue: false,
      })
    ).toEqual({ enabled: false, source: "location" })
    expect(
      resolveFeatureFlag(true, {
        isEnabled: true,
        defaultValue: true,
        locationValue: null,
      })
    ).toEqual({ enabled: true, source: "global" })
  })
})
