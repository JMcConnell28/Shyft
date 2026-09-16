import type { RotaSettingsPageData } from "@/features/settings/types"
import { DEFAULT_ROTA_SETTINGS } from "@/features/rota/constants/rota-settings"
import { requireRotaSettingsPermission } from "@/features/settings/server/rota-settings-shared"
import { getDatabase } from "@/lib/db"

async function getRotaSettingsPageData(input: {
  organizationId?: string
  locationId?: string
  userId: string
}): Promise<RotaSettingsPageData> {
  await requireRotaSettingsPermission(input)

  const database = getDatabase()
  const [locationsResult, zonesResult, templatesResult] = await Promise.all([
    database.query<{
      allow_edit_after_publish: boolean | null
      confirm_shift_delete: boolean | null
      copy_notes_by_default: boolean | null
      default_zone_id: string | null
      id: string
      name: string
      notify_staff_on_publish: boolean | null
      show_notes_to_staff: boolean | null
      slug: string
    }>(
      `select
         location.id,
         location.name,
         location.slug,
         rota_settings.allow_edit_after_publish,
         rota_settings.confirm_shift_delete,
         rota_settings.copy_notes_by_default,
         case
           when default_zone.deleted_at is null then rota_settings.default_zone_id
           else null
         end as default_zone_id,
         rota_settings.notify_staff_on_publish,
         rota_settings.show_notes_to_staff
       from public.locations location
       left join public.location_rota_settings rota_settings
         on rota_settings.location_id = location.id
       left join public.zones default_zone
         on default_zone.id = rota_settings.default_zone_id
       where (
         ($1::text is not null and location.organization_id = $1::text)
         or ($2::uuid is not null and location.id = $2::uuid)
       )
       order by location.created_at asc, location.name asc`,
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
      settings: {
        allowEditAfterPublish:
          location.allow_edit_after_publish ??
          DEFAULT_ROTA_SETTINGS.allowEditAfterPublish,
        confirmShiftDelete:
          location.confirm_shift_delete ??
          DEFAULT_ROTA_SETTINGS.confirmShiftDelete,
        copyNotesByDefault:
          location.copy_notes_by_default ??
          DEFAULT_ROTA_SETTINGS.copyNotesByDefault,
        defaultZoneId: location.default_zone_id,
        notifyStaffOnPublish:
          location.notify_staff_on_publish ??
          DEFAULT_ROTA_SETTINGS.notifyStaffOnPublish,
        showNotesToStaff:
          location.show_notes_to_staff ??
          DEFAULT_ROTA_SETTINGS.showNotesToStaff,
      },
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

export { getRotaSettingsPageData }
