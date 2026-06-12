import { getDatabase } from "@/lib/db"

import type { LocationSettingsPageData } from "@/features/settings/types"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import { requireLocationPermission } from "@/lib/auth/has-location-permission"

async function getLocationSettingsPageData(input: {
  organizationId?: string
  locationId?: string
  userId: string
}): Promise<LocationSettingsPageData> {
  if (input.organizationId) {
    await requireOrgPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permissions: {
        location: ["update"],
      },
      errorMessage: "You do not have permission to manage location settings.",
    })
  } else if (input.locationId) {
    await requireLocationPermission({
      locationId: input.locationId,
      userId: input.userId,
      permissions: {
        location: ["update"],
      },
      errorMessage: "You do not have permission to manage location settings.",
    })
  } else {
    throw new Error("Choose a workspace before opening location settings.")
  }

  const database = getDatabase()
  const [locationsResult, operatingHoursResult] = await Promise.all([
    database.query<{
      estimated_closing_time: string
      estimated_closing_time_next_day: boolean
      id: string
      name: string
      slug: string
    }>(
      `select id, name, slug, estimated_closing_time, estimated_closing_time_next_day
       from public.locations
       where ${input.organizationId ? "organization_id = $1" : "id = $1"}
       order by created_at asc, name asc`,
      [input.organizationId ?? input.locationId],
    ),
    database.query<{
      close_time: string
      close_time_next_day: boolean
      location_id: string
      weekday: number
    }>(
      `select location_id, weekday, close_time, close_time_next_day
       from public.location_operating_hours
       where ${input.organizationId ? "organization_id = $1" : "location_id = $1"}`,
      [input.organizationId ?? input.locationId],
    ),
  ])

  const operatingHourByLocationAndWeekday = new Map(
    operatingHoursResult.rows.map((row) => [
      `${row.location_id}:${row.weekday}`,
      row,
    ]),
  )

  return {
    locations: locationsResult.rows.map((location) => ({
      daySettings: buildDaySettings(
        location.id,
        location.estimated_closing_time.slice(0, 5),
        location.estimated_closing_time_next_day,
        operatingHourByLocationAndWeekday,
      ),
      id: location.id,
      name: location.name,
      slug: location.slug,
      estimatedClosingTime: location.estimated_closing_time.slice(0, 5),
      estimatedClosingTimeNextDay: location.estimated_closing_time_next_day,
    })),
  }
}

function buildDaySettings(
  locationId: string,
  fallbackCloseTime: string,
  fallbackNextDay: boolean,
  operatingHourByLocationAndWeekday: Map<
    string,
    {
      close_time: string
      close_time_next_day: boolean
      location_id: string
      weekday: number
    }
  >,
) {
  return Array.from({ length: 7 }, (_, index) => {
    const weekday = index + 1
    const savedRow = operatingHourByLocationAndWeekday.get(`${locationId}:${weekday}`)

    return {
      weekday,
      closeTime: savedRow?.close_time.slice(0, 5) ?? fallbackCloseTime,
      closeTimeNextDay: savedRow?.close_time_next_day ?? fallbackNextDay,
    }
  })
}

export { getLocationSettingsPageData }
