import type { GeneralSettingsPageData } from "@/features/settings/types"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import { getDatabase } from "@/lib/db"

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
  const [organizationResult, locationsResult] = await Promise.all([
    database.query<{
      contactEmail: string | null
      contactPhone: string | null
      name: string
      slug: string
    }>(
      `select
         contact_email as "contactEmail",
         contact_phone as "contactPhone",
         name,
         slug
       from public."organization"
       where id = $1
       limit 1`,
      [input.organizationId]
    ),
    database.query<{ id: string; name: string; slug: string }>(
      `select id, name, slug
       from public.locations
       where organization_id = $1
       order by name asc`,
      [input.organizationId]
    ),
  ])

  const organization = organizationResult.rows.at(0)

  if (!organization) {
    throw new Error("Organization not found.")
  }

  return {
    contactEmail: organization.contactEmail ?? "",
    contactPhone: organization.contactPhone ?? "",
    locations: locationsResult.rows,
    organization: {
      name: organization.name,
      slug: organization.slug,
    },
  }
}

export { getGeneralSettingsPageData }
