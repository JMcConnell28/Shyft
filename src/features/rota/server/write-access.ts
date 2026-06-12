import { ensureLocationAccessOrThrow } from "@/features/rota/server/access"
import { requireVerifiedSessionOrThrow } from "@/features/rota/server/request-session"
import { requireLocationPermission } from "@/lib/auth/has-location-permission"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import type { OrganizationPermissionRequest } from "@/lib/auth/has-org-permission"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import {
  assertSupabaseSuccess,
  getRequiredSupabaseRow,
} from "@/lib/supabase-errors"

type RotaWritePermission = "publish" | "update"

type WritableRota = {
  has_unpublished_changes: boolean
  id: string
  location_id: string
  note: string | null
  organization_id: string | null
  published_version: number
  status: string
  week_start: string
}

const permissionByAction = {
  publish: {
    rota: ["publish"],
  },
  update: {
    rota: ["update"],
  },
} satisfies Record<RotaWritePermission, OrganizationPermissionRequest>

async function requireRotaWriteAccess({
  rotaId,
  permission,
  errorMessage,
}: {
  rotaId: string
  permission: RotaWritePermission
  errorMessage: string
}) {
  const { session } = await requireVerifiedSessionOrThrow()
  const supabase = createSupabaseServerClient()
  const rotaResult = await supabase
    .from("rotas")
    .select(
      "id, location_id, organization_id, status, week_start, note, published_version, has_unpublished_changes"
    )
    .eq("id", rotaId)
    .maybeSingle()

  assertSupabaseSuccess(rotaResult.error, "That rota could not be found.")

  const rota = getRequiredSupabaseRow(
    rotaResult.data as WritableRota | null,
    "That rota could not be found.",
  )
  const permissions = permissionByAction[permission]
  const organizationId = rota.organization_id
  const role = organizationId
    ? await requireOrgPermission({
        organizationId,
        userId: session.user.id,
        permissions,
        errorMessage,
      })
    : await requireLocationPermission({
        locationId: rota.location_id,
        userId: session.user.id,
        permissions,
        errorMessage,
      })
  const { location } = await ensureLocationAccessOrThrow(
    organizationId,
    session.user.id,
    rota.location_id,
    role,
  )

  return {
    location,
    organizationId,
    rota,
    session,
    supabase,
    userId: session.user.id,
  }
}

export { requireRotaWriteAccess }
export type { WritableRota }
