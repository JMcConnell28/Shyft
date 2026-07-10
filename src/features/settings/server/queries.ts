import { getDatabase } from "@/lib/db"

import type { GeneralSettingsPageData } from "@/features/settings/types"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"

async function getGeneralSettingsPageData(input: {
  organizationId: string
  userId: string
}): Promise<GeneralSettingsPageData> {
  await requireOrgPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permissions: {
      organization: ["update"],
    },
    errorMessage: "You do not have permission to manage general settings.",
  })

  const database = getDatabase()
  const result = await database.query<{
    estimatedClosingTime: string
  }>(
    `select "estimatedClosingTime"
     from public."organization"
     where id = $1
     limit 1`,
    [input.organizationId],
  )

  return {
    estimatedClosingTime:
      result.rows[0]?.estimatedClosingTime?.slice(0, 5) ?? "23:00",
  }
}

export { getGeneralSettingsPageData }
