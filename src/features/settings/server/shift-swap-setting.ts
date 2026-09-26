import "@tanstack/react-start/server-only"

import { requireRotaSettingsPermission } from "@/features/settings/server/rota-settings-shared"
import { getDatabase } from "@/lib/db"

async function updateShiftSwapSetting(input: {
  enabled: boolean
  organizationId: string
  userId: string
}): Promise<boolean> {
  await requireRotaSettingsPermission(input)

  const result = await getDatabase().query<{ shift_swaps_enabled: boolean }>(
    `update public."organization"
     set shift_swaps_enabled = $2
     where id = $1
     returning shift_swaps_enabled`,
    [input.organizationId, input.enabled]
  )

  const setting = result.rows.at(0)
  if (!setting) throw new Error("Workspace not found.")
  return setting.shift_swaps_enabled
}

export { updateShiftSwapSetting }
