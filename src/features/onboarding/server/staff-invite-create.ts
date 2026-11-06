import "@tanstack/react-start/server-only"
import { randomUUID } from "node:crypto"
import { STAFF_INVITE_EXPIRY_DAYS } from "../constants"
import { buildStaffInviteUrl } from "../utils/invite-utils"
import { requireStaffInviteAdmin } from "./staff-invite-context"
import { upsertOnboardingState } from "./state"
import type { StaffInviteSelection } from "../schemas/staff-invite-schemas"
import { requireWorkspaceWriteAccess } from "@/features/billing/server/workspace-write-access"
import { getDatabase } from "@/lib/db"

async function createStaffInviteLink(
  input: StaffInviteSelection,
  reuse = false
) {
  const userId = await requireStaffInviteAdmin(input.organizationId)
  await requireWorkspaceWriteAccess({ organizationId: input.organizationId })
  const client = await getDatabase().connect()
  let token: string
  try {
    await client.query("begin")
    await client.query(
      "select pg_advisory_xact_lock(hashtext('staff_invite_link'), hashtext($1))",
      [input.organizationId]
    )
    const selection = await client.query<{ valid: boolean }>(
      `select exists(select 1 from public.staff_groups where id = $2 and organization_id = $1)
        and not exists(select 1 from unnest($3::uuid[]) selected(id)
          where not exists(select 1 from public.locations location
            where location.id = selected.id and location.organization_id = $1)) as valid`,
      [input.organizationId, input.defaultStaffGroupId, input.locationIds]
    )
    if (!selection.rows[0]?.valid)
      throw new Error(
        "Choose locations and a staff group from this organization."
      )
    const active = reuse
      ? await client.query<{ token: string }>(
          `select token from public.staff_invite_links where organization_id = $1
       and disabled_at is null and (expires_at is null or expires_at > now())
       and default_staff_group_id = $2
       and coalesce(location_ids, array_remove(array[location_id], null)) @> $3::uuid[]
       and coalesce(location_ids, array_remove(array[location_id], null)) <@ $3::uuid[]
       order by created_at desc limit 1`,
          [input.organizationId, input.defaultStaffGroupId, input.locationIds]
        )
      : null
    if (active?.rows[0]) {
      token = active.rows[0].token
    } else {
      await client.query(
        `update public.staff_invite_links set disabled_at = now()
        where organization_id = $1 and disabled_at is null`,
        [input.organizationId]
      )
      token = randomUUID().replaceAll("-", "")
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + STAFF_INVITE_EXPIRY_DAYS)
      await client.query(
        `insert into public.staff_invite_links
        (organization_id, location_ids, default_staff_group_id, token, expires_at, created_by)
        values ($1, $2::uuid[], $3, $4, $5, $6)`,
        [
          input.organizationId,
          input.locationIds,
          input.defaultStaffGroupId,
          token,
          expiresAt,
          userId,
        ]
      )
    }
    await client.query("commit")
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
  await upsertOnboardingState(input.organizationId, {
    lastStep: "complete",
    completedAt: new Date(),
  })
  return { token, joinUrl: buildStaffInviteUrl(token) }
}

export { createStaffInviteLink }
