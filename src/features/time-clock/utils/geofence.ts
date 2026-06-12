import type { GpsCoordinates } from "@/features/time-clock/types"

type GeofenceSettings = {
  latitude: number | null
  longitude: number | null
  radiusMeters: number
  maxAccuracyMeters: number
}

type GeofenceResult =
  | {
      success: true
      distanceMeters: number
    }
  | {
      success: false
      distanceMeters: number | null
      reason: string
    }

const EARTH_RADIUS_METERS = 6371000

function validateGeofence(
  settings: GeofenceSettings,
  gps: GpsCoordinates,
): GeofenceResult {
  if (settings.latitude === null || settings.longitude === null) {
    return {
      success: false,
      distanceMeters: null,
      reason: "Clocking is not fully set up for this location.",
    }
  }

  if (gps.accuracyMeters > settings.maxAccuracyMeters) {
    return {
      success: false,
      distanceMeters: null,
      reason: "Your phone location is not accurate enough. Move closer to the venue and try again.",
    }
  }

  const distanceMeters = getDistanceMeters(
    {
      latitude: settings.latitude,
      longitude: settings.longitude,
    },
    gps,
  )

  if (distanceMeters > settings.radiusMeters) {
    return {
      success: false,
      distanceMeters,
      reason: `You appear to be ${formatDistance(distanceMeters)} from the saved venue point. The clock-in radius is ${settings.radiusMeters}m.`,
    }
  }

  return {
    success: true,
    distanceMeters,
  }
}

function getDistanceMeters(
  first: Pick<GpsCoordinates, "latitude" | "longitude">,
  second: Pick<GpsCoordinates, "latitude" | "longitude">,
) {
  const firstLatitude = toRadians(first.latitude)
  const secondLatitude = toRadians(second.latitude)
  const latitudeDelta = toRadians(second.latitude - first.latitude)
  const longitudeDelta = toRadians(second.longitude - first.longitude)

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2

  return 2 * EARTH_RADIUS_METERS * Math.atan2(
    Math.sqrt(haversine),
    Math.sqrt(1 - haversine),
  )
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function formatDistance(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}km`
  }

  return `${Math.round(value)}m`
}

export { getDistanceMeters, validateGeofence }
export type { GeofenceResult, GeofenceSettings }
