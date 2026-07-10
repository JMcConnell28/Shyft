import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import { getDatabase } from "@/lib/db"

async function updateGeneralSettings(input: {
  organizationId: string
  userId: string
  estimatedClosingTime: string
}) {
  await requireOrgPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permissions: {
      organization: ["update"],
    },
    errorMessage: "You do not have permission to update general settings.",
  })

  const database = getDatabase()
  await database.query(
    `update public."organization"
     set "estimatedClosingTime" = $2
     where id = $1`,
    [input.organizationId, input.estimatedClosingTime],
  )

  return {
    estimatedClosingTime: input.estimatedClosingTime,
  }
}

export { updateGeneralSettings }
