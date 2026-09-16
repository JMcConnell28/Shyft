import type { RotaSettingsValues } from "@/features/settings/types"
import { requireRotaSettingsPermission } from "@/features/settings/server/rota-settings-shared"
import { getDatabase } from "@/lib/db"

type UpdateRotaSettingsInput = RotaSettingsValues & {
  organizationId?: string
  locationId: string
  userId: string
}

async function updateRotaSettings(
  input: UpdateRotaSettingsInput
): Promise<RotaSettingsValues> {
  await requireRotaSettingsPermission(input)
  const database = getDatabase()
  const locationResult = await database.query<{
    organization_id: string | null
  }>(
    `select organization_id
     from public.locations
     where id = $1::uuid
       and (
         ($2::text is not null and organization_id = $2::text)
         or ($2::text is null and $3::uuid = id)
       )
     limit 1`,
    [input.locationId, input.organizationId ?? null, input.locationId]
  )
  const location = locationResult.rows.at(0)

  if (!location) {
    throw new Error("Choose a location in this workspace.")
  }

  if (input.defaultZoneId) {
    const zoneResult = await database.query<{ id: string }>(
      `select id
       from public.zones
       where id = $1::uuid
         and location_id = $2::uuid
         and deleted_at is null
       limit 1`,
      [input.defaultZoneId, input.locationId]
    )

    if (!zoneResult.rows.at(0)) {
      throw new Error("Choose a zone from this location.")
    }
  }

  await database.query(
    `insert into public.location_rota_settings (
       location_id,
       organization_id,
       default_zone_id,
       allow_edit_after_publish,
       confirm_shift_delete,
       copy_notes_by_default,
       notify_staff_on_publish,
       show_notes_to_staff
     ) values ($1,$2,$3,$4,$5,$6,$7,$8)
     on conflict (location_id)
     do update set
       organization_id = excluded.organization_id,
       default_zone_id = excluded.default_zone_id,
       allow_edit_after_publish = excluded.allow_edit_after_publish,
       confirm_shift_delete = excluded.confirm_shift_delete,
       copy_notes_by_default = excluded.copy_notes_by_default,
       notify_staff_on_publish = excluded.notify_staff_on_publish,
       show_notes_to_staff = excluded.show_notes_to_staff,
       updated_at = timezone('utc', now())`,
    [
      input.locationId,
      location.organization_id,
      input.defaultZoneId,
      input.allowEditAfterPublish,
      input.confirmShiftDelete,
      input.copyNotesByDefault,
      input.notifyStaffOnPublish,
      input.showNotesToStaff,
    ]
  )

  return {
    allowEditAfterPublish: input.allowEditAfterPublish,
    confirmShiftDelete: input.confirmShiftDelete,
    copyNotesByDefault: input.copyNotesByDefault,
    defaultZoneId: input.defaultZoneId,
    notifyStaffOnPublish: input.notifyStaffOnPublish,
    showNotesToStaff: input.showNotesToStaff,
  }
}

export { updateRotaSettings }
