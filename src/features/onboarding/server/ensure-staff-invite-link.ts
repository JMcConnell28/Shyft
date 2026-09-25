import { randomUUID } from "node:crypto"
import { createServerFn } from "@tanstack/react-start"

import { requireWorkspaceWriteAccess } from "@/features/billing/server/workspace-write-access"
import { STAFF_INVITE_EXPIRY_DAYS } from "@/features/onboarding/constants"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { buildStaffInviteUrl } from "@/features/onboarding/utils/invite-utils"
import { requireLocationPermission } from "@/lib/auth/has-location-permission"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import { getDatabase } from "@/lib/db"
import { staffInviteSelectionSchema } from "@/lib/onboarding-schemas"

const ensureActiveStaffInviteLink = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => staffInviteSelectionSchema.parse(input))
  .handler(async ({ data }) => {
    const { session } = await requireVerifiedSessionOrThrow()
    const organizationId = session.session.activeOrganizationId

    if (organizationId) {
      await requireOrgPermission({
        organizationId,
        userId: session.user.id,
        permissions: { invitation: ["create"] },
        errorMessage: "You do not have permission to create invite links.",
      })
    } else {
      await requireLocationPermission({
        locationId: data.locationId,
        userId: session.user.id,
        permissions: { invitation: ["create"] },
        errorMessage: "You do not have permission to create invite links.",
      })
    }

    const client = await getDatabase().connect()
    try {
      await client.query("BEGIN")
      await client.query(
        "select pg_advisory_xact_lock(hashtext('staff_invite_link'), hashtext($1::text))",
        [organizationId ?? data.locationId]
      )

      const active = await client.query<{ token: string }>(
        `select token from public.staff_invite_links
         where (($1::text is not null and organization_id = $1)
            or ($1::text is null and location_id = $2::uuid))
           and disabled_at is null
           and (expires_at is null or expires_at > now())
         order by created_at desc
         limit 1`,
        [organizationId, data.locationId]
      )

      if (active.rows[0]) {
        await client.query("COMMIT")
        return { joinUrl: buildStaffInviteUrl(active.rows[0].token) }
      }

      await requireWorkspaceWriteAccess({ locationId: data.locationId })

      const selection = await client.query<{ id: string }>(
        `select l.id from public.locations l
         join public.staff_groups g on g.id = $2::uuid
         where l.id = $1::uuid
           and (($3::text is not null
                 and l.organization_id = $3
                 and g.organization_id = $3)
             or ($3::text is null
                 and l.organization_id is null
                 and g.location_id = l.id))`,
        [data.locationId, data.defaultStaffGroupId, organizationId]
      )

      if (!selection.rows[0]) {
        throw new Error("Choose a valid location and staff group.")
      }

      const token = randomUUID().replace(/-/g, "")
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + STAFF_INVITE_EXPIRY_DAYS)

      await client.query(
        `insert into public.staff_invite_links
           (organization_id, location_id, default_staff_group_id, token, expires_at, created_by)
         values ($1, $2, $3, $4, $5, $6)`,
        [
          organizationId,
          data.locationId,
          data.defaultStaffGroupId,
          token,
          expiresAt.toISOString(),
          session.user.id,
        ]
      )

      await client.query("COMMIT")
      return { joinUrl: buildStaffInviteUrl(token) }
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  })

export { ensureActiveStaffInviteLink }
