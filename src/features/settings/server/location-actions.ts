import { getDatabase } from "@/lib/db"

import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import { requireLocationPermission } from "@/lib/auth/has-location-permission"

async function updateLocationSettings(input: {
  organizationId?: string
  workspaceLocationId?: string
  locationId: string
  daySettings: Array<{
    closeTime: string
    closeTimeNextDay: boolean
    weekday: number
  }>
  userId: string
  estimatedClosingTime: string
  estimatedClosingTimeNextDay: boolean
}) {
  if (input.organizationId) {
    await requireOrgPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permissions: {
        location: ["update"],
      },
      errorMessage: "You do not have permission to update location settings.",
    })
  } else {
    await requireLocationPermission({
      locationId: input.locationId,
      userId: input.userId,
      permissions: {
        location: ["update"],
      },
      errorMessage: "You do not have permission to update location settings.",
    })
  }

  const database = getDatabase()
  const client = await database.connect()

  try {
    await client.query("BEGIN")

    await client.query(
      `update public.locations
       set estimated_closing_time = $3,
           estimated_closing_time_next_day = $4,
           updated_at = timezone('utc', now())
       where id = $1
         and ($2::text is null or organization_id = $2)`,
      [
        input.locationId,
        input.organizationId ?? null,
        input.estimatedClosingTime,
        input.estimatedClosingTimeNextDay,
      ],
    )

    await client.query(
      `delete from public.location_operating_hours
       where location_id = $1`,
      [input.locationId],
    )

    if (input.daySettings.length > 0) {
      const values = input.daySettings
        .map(
          (_, index) =>
            `($1, $2, $${index * 3 + 3}, $${index * 3 + 4}, $${index * 3 + 5})`,
        )
        .join(", ")
      const parameters = [
        input.organizationId ?? null,
        input.locationId,
        ...input.daySettings.flatMap((day) => [
          day.weekday,
          day.closeTime,
          day.closeTimeNextDay,
        ]),
      ]

      await client.query(
        `insert into public.location_operating_hours (
           organization_id,
           location_id,
           weekday,
           close_time,
           close_time_next_day
         ) values ${values}`,
        parameters,
      )
    }

    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }

  return {
    daySettings: input.daySettings,
    locationId: input.locationId,
    estimatedClosingTime: input.estimatedClosingTime,
    estimatedClosingTimeNextDay: input.estimatedClosingTimeNextDay,
  }
}

export { updateLocationSettings }
