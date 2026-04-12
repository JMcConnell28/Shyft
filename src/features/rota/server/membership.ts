import type { MembershipRole } from "@/features/rota/types"
import {
  getOrganizationRole,
  requireOrgPermission,
} from "@/lib/auth/has-org-permission"

async function getMembershipRole(
  organizationId: string,
  userId: string,
): Promise<MembershipRole | null> {
  return getOrganizationRole(organizationId, userId)
}

async function assertManagerLevelRole(organizationId: string, userId: string) {
  await requireOrgPermission({
    organizationId,
    userId,
    permissions: {
      rota: ["create"],
    },
    errorMessage: "You do not have permission to manage rotas.",
  })
}

export { assertManagerLevelRole, getMembershipRole }

