import { getDatabase } from "@/lib/db"

import type { RotaSettingsPageData } from "@/features/settings/types"
import { requireLocationPermission } from "@/lib/auth/has-location-permission"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"

async function getRotaSettingsPageData(input: {
  organizationId?: string
  locationId?: string
  userId: string
}): Promise<RotaSettingsPageData> {
  await requireRotaSettingsPermission(input)

  const database = getDatabase()
  const [locationsResult, zonesResult, templatesResult] = await Promise.all([
    database.query<{
      id: string
      name: string
      slug: string
    }>(
      `select id, name, slug
       from public.locations
       where (
         ($1::text is not null and organization_id = $1::text)
         or ($2::uuid is not null and id = $2::uuid)
       )
       order by created_at asc, name asc`,
      [input.organizationId ?? null, input.locationId ?? null]
    ),
    database.query<{
      id: string
      location_id: string
      name: string
      sort_order: number
    }>(
      `select id, location_id, name, sort_order
       from public.zones
       where (
         ($1::text is not null and organization_id = $1::text)
         or ($2::uuid is not null and location_id = $2::uuid)
       )
       and deleted_at is null
       order by location_id asc, sort_order asc, created_at asc, name asc`,
      [input.organizationId ?? null, input.locationId ?? null]
    ),
    database.query<{
      id: string
      location_id: string
      location_name: string
      name: string
      shift_count: string
    }>(
      `select
         template.id,
         template.location_id,
         location.name as location_name,
         template.name,
         count(template_shift.id) as shift_count
       from public.rota_templates template
       join public.locations location on location.id = template.location_id
       left join public.rota_template_shifts template_shift
         on template_shift.template_id = template.id
       where (
         ($1::text is not null and template.organization_id = $1::text)
         or ($2::uuid is not null and template.location_id = $2::uuid)
       )
       group by template.id, template.location_id, location.name, template.name
       order by location.name asc, lower(template.name) asc`,
      [input.organizationId ?? null, input.locationId ?? null]
    ),
  ])

  const zonesByLocationId = new Map<
    string,
    RotaSettingsPageData["locations"][number]["zones"]
  >()

  for (const zone of zonesResult.rows) {
    const existingZones = zonesByLocationId.get(zone.location_id) ?? []
    existingZones.push({
      id: zone.id,
      name: zone.name,
      sortOrder: zone.sort_order,
    })
    zonesByLocationId.set(zone.location_id, existingZones)
  }

  return {
    locations: locationsResult.rows.map((location) => ({
      id: location.id,
      name: location.name,
      slug: location.slug,
      zones: zonesByLocationId.get(location.id) ?? [],
    })),
    templates: templatesResult.rows.map((template) => ({
      id: template.id,
      locationId: template.location_id,
      locationName: template.location_name,
      name: template.name,
      shiftCount: Number(template.shift_count),
    })),
  }
}

async function requireRotaSettingsPermission(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  if (input.organizationId) {
    await requireOrgPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permissions: {
        location: ["update"],
      },
      errorMessage: "You do not have permission to manage rota settings.",
    })
    return
  }

  if (!input.locationId) {
    throw new Error("Choose a location.")
  }

  await requireLocationPermission({
    locationId: input.locationId,
    userId: input.userId,
    permissions: {
      location: ["update"],
    },
    errorMessage: "You do not have permission to manage rota settings.",
  })
}

export { getRotaSettingsPageData }
