import type { RotaSettingsValues } from "@/features/rota/types/settings"
import { DEFAULT_ROTA_SETTINGS } from "@/features/rota/constants/rota-settings"
import { getDatabase } from "@/lib/db"

async function getLocationRotaSettings(
  locationId: string
): Promise<RotaSettingsValues> {
  const result = await getDatabase().query<{
    allow_edit_after_publish: boolean
    confirm_shift_delete: boolean
    copy_notes_by_default: boolean
    default_zone_id: string | null
    notify_staff_on_publish: boolean
    show_notes_to_staff: boolean
  }>(
    `select
       settings.allow_edit_after_publish,
       settings.confirm_shift_delete,
       settings.copy_notes_by_default,
       case
         when zone.deleted_at is null then settings.default_zone_id
         else null
       end as default_zone_id,
       settings.notify_staff_on_publish,
       settings.show_notes_to_staff
     from public.location_rota_settings settings
     left join public.zones zone on zone.id = settings.default_zone_id
     where settings.location_id = $1::uuid
     limit 1`,
    [locationId]
  )
  const row = result.rows.at(0)

  if (!row) {
    return { ...DEFAULT_ROTA_SETTINGS }
  }

  return {
    allowEditAfterPublish: row.allow_edit_after_publish,
    confirmShiftDelete: row.confirm_shift_delete,
    copyNotesByDefault: row.copy_notes_by_default,
    defaultZoneId: row.default_zone_id,
    notifyStaffOnPublish: row.notify_staff_on_publish,
    showNotesToStaff: row.show_notes_to_staff,
  }
}

export { getLocationRotaSettings }
