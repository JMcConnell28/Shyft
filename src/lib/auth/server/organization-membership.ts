import "@tanstack/react-start/server-only"

import type { OrganizationRole } from "@/lib/auth/permissions"
import {
  membershipRowsSchema,
  organizationRoleSchema,
} from "@/lib/auth/schemas/organization-membership"
import { getDatabase } from "@/lib/db"
import { timeServerOperation } from "@/lib/server-timing"

async function readOrganizationMembershipRole(
  organizationId: string,
  userId: string
): Promise<OrganizationRole | null> {
  const result = await timeServerOperation("membership", () =>
    getDatabase().query<{ role: unknown }>(
      `select role from public.member
       where "organizationId" = $1 and "userId" = $2`,
      [organizationId, userId]
    )
  )
  const rows = membershipRowsSchema.parse(result.rows)
  const role = organizationRoleSchema.safeParse(rows[0]?.role)
  return role.success ? role.data : null
}

export { readOrganizationMembershipRole }
