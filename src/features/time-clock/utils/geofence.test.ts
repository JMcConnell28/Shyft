import { describe, expect, it } from "vitest"

import { validateGeofence } from "@/features/time-clock/utils/geofence"

describe("validateGeofence", () => {
  it("accepts accurate coordinates inside the configured radius", () => {
    const result = validateGeofence(
      {
        latitude: 51.5072,
        longitude: -0.1276,
        radiusMeters: 100,
        maxAccuracyMeters: 50,
      },
      {
        latitude: 51.50725,
        longitude: -0.12765,
        accuracyMeters: 20,
      },
    )

    expect(result.success).toBe(true)
  })

  it("rejects inaccurate coordinates", () => {
    const result = validateGeofence(
      {
        latitude: 51.5072,
        longitude: -0.1276,
        radiusMeters: 100,
        maxAccuracyMeters: 50,
      },
      {
        latitude: 51.50725,
        longitude: -0.12765,
        accuracyMeters: 120,
      },
    )

    expect(result.success).toBe(false)
  })

  it("rejects coordinates outside the venue radius", () => {
    const result = validateGeofence(
      {
        latitude: 51.5072,
        longitude: -0.1276,
        radiusMeters: 50,
        maxAccuracyMeters: 50,
      },
      {
        latitude: 51.51,
        longitude: -0.1276,
        accuracyMeters: 20,
      },
    )

    expect(result.success).toBe(false)
  })
})
