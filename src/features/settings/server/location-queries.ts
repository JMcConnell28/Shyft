import type { LocationSettingsPageData } from "@/features/settings/types"
import { getDatabase } from "@/lib/db"

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
  const [locationsResult, operatingHoursResult, employeeCountResult] =
    await Promise.all([
      database.query<{
        employee_count: string
        estimated_closing_time: string
        estimated_closing_time_next_day: boolean
        id: string
        name: string
        slug: string
        zone_count: string
      }>(
        `select location.id,
              location.name,
              location.slug,
              location.estimated_closing_time,
              location.estimated_closing_time_next_day,
              count(distinct assignment.employee_id) filter (
                where assignment.is_enabled = true and assignment.disabled_at is null
              ) as employee_count,
              count(distinct zone.id) filter (where zone.deleted_at is null) as zone_count
       from public.locations location
       left join public.employee_location_assignments assignment
         on assignment.location_id = location.id
       left join public.zones zone on zone.location_id = location.id
       where ${input.organizationId ? "location.organization_id = $1" : "location.id = $1"}
       group by location.id
       order by location.created_at asc, location.name asc`,
        [input.organizationId ?? input.locationId]
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
        [input.organizationId ?? input.locationId]
      ),
      database.query<{ total: string }>(
        `select count(distinct employee.id) as total
       from public.employees employee
       where ${input.organizationId ? "employee.organization_id = $1" : "employee.location_id = $1"}
         and employee.status = 'active'`,
        [input.organizationId ?? input.locationId]
      ),
    ])

  const operatingHourByLocationAndWeekday = new Map(
    operatingHoursResult.rows.map((row) => [
      `${row.location_id}:${row.weekday}`,
      row,
    ])
  )

  return {
    locations: locationsResult.rows.map((location) => ({
      daySettings: buildDaySettings(
        location.id,
        location.estimated_closing_time.slice(0, 5),
        location.estimated_closing_time_next_day,
        operatingHourByLocationAndWeekday
      ),
      id: location.id,
      name: location.name,
      slug: location.slug,
      employeeCount: Number(location.employee_count),
      zoneCount: Number(location.zone_count),
      estimatedClosingTime: location.estimated_closing_time.slice(0, 5),
      estimatedClosingTimeNextDay: location.estimated_closing_time_next_day,
    })),
    totalEmployeeCount: Number(employeeCountResult.rows[0]?.total ?? 0),
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
  >
) {
  return Array.from({ length: 7 }, (_, index) => {
    const weekday = index + 1
    const savedRow = operatingHourByLocationAndWeekday.get(
      `${locationId}:${weekday}`
    )

    return {
      weekday,
      closeTime: savedRow?.close_time.slice(0, 5) ?? fallbackCloseTime,
      closeTimeNextDay: savedRow?.close_time_next_day ?? fallbackNextDay,
    }
  })
}

export { getLocationSettingsPageData }
