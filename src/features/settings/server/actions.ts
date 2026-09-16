import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import { getDatabase } from "@/lib/db"

async function updateGeneralSettings(input: {
  contactEmail: string
  contactPhone: string
  organizationId: string
  userId: string
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
     set
       contact_email = nullif($2, ''),
       contact_phone = nullif($3, '')
     where id = $1`,
    [input.organizationId, input.contactEmail, input.contactPhone]
  )

  return {
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
  }
}

export { updateGeneralSettings }
