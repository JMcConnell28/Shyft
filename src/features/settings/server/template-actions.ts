import type { PoolClient } from "pg"

import { assertTemplateNameAvailable } from "@/features/rota/server/template-actions"
import { requireLocationPermission } from "@/lib/auth/has-location-permission"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import { getDatabase } from "@/lib/db"

type TemplateWorkspaceInput = {
  organizationId?: string
  locationId?: string
  userId: string
}

async function renameRotaTemplate(
  input: TemplateWorkspaceInput & {
    templateId: string
    name: string
  },
) {
  await requireTemplateSettingsPermission(input)
  const client = await getDatabase().connect()

  try {
    await client.query("BEGIN")
    const template = await getTemplateForSettingsOrThrow(client, input)
    await assertTemplateNameAvailable(client, {
      locationId: template.location_id,
      name: input.name,
      excludeTemplateId: input.templateId,
    })
    await client.query(
      `update public.rota_templates
       set name = $2,
           updated_at = timezone('utc', now())
       where id = $1`,
      [input.templateId, input.name.trim()],
    )
    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

async function deleteRotaTemplate(
  input: TemplateWorkspaceInput & {
    templateId: string
  },
) {
  await requireTemplateSettingsPermission(input)
  const client = await getDatabase().connect()

  try {
    await client.query("BEGIN")
    await getTemplateForSettingsOrThrow(client, input)
    await client.query(`delete from public.rota_templates where id = $1`, [
      input.templateId,
    ])
    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

async function getTemplateForSettingsOrThrow(
  client: PoolClient,
  input: TemplateWorkspaceInput & { templateId: string },
) {
  const result = await client.query<{
    id: string
    location_id: string
  }>(
    `select id, location_id
     from public.rota_templates
     where id = $1
       and (
         ($2::text is not null and organization_id = $2::text)
         or (
           $2::text is null
           and organization_id is null
           and location_id = $3::uuid
         )
       )
     limit 1`,
    [input.templateId, input.organizationId ?? null, input.locationId ?? null],
  )
  const template = result.rows[0]

  if (!template) {
    throw new Error("Choose a valid template.")
  }

  return template
}

async function requireTemplateSettingsPermission(input: TemplateWorkspaceInput) {
  if (input.organizationId) {
    await requireOrgPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permissions: {
        rota: ["update"],
      },
      errorMessage: "You do not have permission to manage rota templates.",
    })
    return
  }

  if (!input.locationId) {
    throw new Error("Choose a location.")
  }

  await requireLocationPermission({
    locationId: input.locationId,
    userId: input.userId,
    permissions: {
      rota: ["update"],
    },
    errorMessage: "You do not have permission to manage rota templates.",
  })
}

export { deleteRotaTemplate, renameRotaTemplate }
