import "@tanstack/react-start/server-only"

import { requireVerifiedSessionOrThrow } from "@/features/rota/server/request-session"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import { getDatabase } from "@/lib/db"

async function isShiftSwappingEnabled(
  organizationId: string
): Promise<boolean> {
  const result = await getDatabase().query<{ shift_swaps_enabled: boolean }>(
    `select shift_swaps_enabled
     from public."organization"
     where id = $1
     limit 1`,
    [organizationId]
  )

  return result.rows.at(0)?.shift_swaps_enabled ?? false
}

async function getShiftSwapAvailability(input: {
  organizationId: string
  userId: string
}): Promise<boolean> {
  const { session } = await requireVerifiedSessionOrThrow()
  if (
    session.user.id !== input.userId ||
    session.session.activeOrganizationId !== input.organizationId
  ) {
    throw new Error("Your workspace session is no longer valid.")
  }

  await requireOrgPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permissions: { rota: ["view"] },
    errorMessage: "You do not have permission to view shift swaps.",
  })

  return isShiftSwappingEnabled(input.organizationId)
}

export { getShiftSwapAvailability, isShiftSwappingEnabled }
