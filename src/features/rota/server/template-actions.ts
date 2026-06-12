import { createServerFn } from "@tanstack/react-start"
import type { PoolClient } from "pg"

import {
  applyRotaTemplateToRotaInputSchema,
  createRotaTemplateFromRotaInputSchema,
  overrideRotaTemplateFromRotaInputSchema,
} from "@/features/rota/schemas/rota-server-schemas"
import { requireRotaWriteAccess } from "@/features/rota/server/write-access"
import type {
  ApplyRotaTemplateResult,
  RotaTemplateMutationResult,
} from "@/features/rota/types"
import { getDatabase } from "@/lib/db"

const createRotaTemplateFromRota = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    createRotaTemplateFromRotaInputSchema.parse(input),
  )
  .handler(async ({ data }): Promise<RotaTemplateMutationResult> => {
    const context = await requireRotaWriteAccess({
      rotaId: data.rotaId,
      permission: "update",
      errorMessage: "You do not have permission to create templates.",
    })
    const name = data.name.trim()
    const database = getDatabase()
    const client = await database.connect()

    try {
      await client.query("BEGIN")
      await assertTemplateNameAvailable(client, {
        locationId: context.location.id,
        name,
      })

      const templateResult = await client.query<{ id: string }>(
        `insert into public.rota_templates (
           organization_id,
           location_id,
           name,
           description,
           created_by
         ) values ($1, $2, $3, null, $4)
         returning id`,
        [context.organizationId, context.location.id, name, context.userId],
      )
      const templateId = templateResult.rows[0]?.id

      if (!templateId) {
        throw new Error("We could not create that template.")
      }

      const shiftCount = await copyRotaShiftsIntoTemplate(client, {
        rotaId: context.rota.id,
        templateId,
      })

      if (shiftCount === 0) {
        throw new Error("Add at least one shift before saving a template.")
      }
      await client.query("COMMIT")

      return { templateId }
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  })

const overrideRotaTemplateFromRota = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    overrideRotaTemplateFromRotaInputSchema.parse(input),
  )
  .handler(async ({ data }): Promise<RotaTemplateMutationResult> => {
    const context = await requireRotaWriteAccess({
      rotaId: data.rotaId,
      permission: "update",
      errorMessage: "You do not have permission to update templates.",
    })
    const database = getDatabase()
    const client = await database.connect()

    try {
      await client.query("BEGIN")
      await getTemplateForLocationOrThrow(client, {
        organizationId: context.organizationId,
        locationId: context.location.id,
        templateId: data.templateId,
      })
      await client.query(
        `delete from public.rota_template_shifts
         where template_id = $1`,
        [data.templateId],
      )
      const shiftCount = await copyRotaShiftsIntoTemplate(client, {
        rotaId: context.rota.id,
        templateId: data.templateId,
      })

      if (shiftCount === 0) {
        throw new Error("Add at least one shift before overriding a template.")
      }
      await client.query(
        `update public.rota_templates
         set updated_at = timezone('utc', now())
         where id = $1`,
        [data.templateId],
      )
      await client.query("COMMIT")

      return { templateId: data.templateId }
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  })

const applyRotaTemplateToRota = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    applyRotaTemplateToRotaInputSchema.parse(input),
  )
  .handler(async ({ data }): Promise<ApplyRotaTemplateResult> => {
    const context = await requireRotaWriteAccess({
      rotaId: data.rotaId,
      permission: "update",
      errorMessage: "You do not have permission to apply templates.",
    })
    const database = getDatabase()
    const client = await database.connect()

    try {
      await client.query("BEGIN")
      await getTemplateForLocationOrThrow(client, {
        organizationId: context.organizationId,
        locationId: context.location.id,
        templateId: data.templateId,
      })
      const shiftCount = await replaceRotaShiftsFromTemplate(client, {
        organizationId: context.organizationId,
        rotaId: context.rota.id,
        templateId: data.templateId,
        weekStart: context.rota.week_start,
      })
      await client.query(
        `update public.rotas
         set shift_count = $2,
             scheduled_hours = 0,
             scheduled_staff_count = 0,
             has_unpublished_changes = case
               when status = 'published' then true
               else has_unpublished_changes
             end,
             updated_at = timezone('utc', now())
         where id = $1`,
        [context.rota.id, shiftCount],
      )
      await client.query("COMMIT")

      return {
        success: true,
        shiftCount,
      }
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  })

async function assertTemplateNameAvailable(
  client: PoolClient,
  input: {
    locationId: string
    name: string
    excludeTemplateId?: string
  },
) {
  const result = await client.query<{ id: string }>(
    `select id
     from public.rota_templates
     where location_id = $1
       and lower(name) = lower($2)
       and ($3::uuid is null or id <> $3::uuid)
     limit 1`,
    [input.locationId, input.name, input.excludeTemplateId ?? null],
  )

  if (result.rows[0]) {
    throw new Error("A template with that name already exists for this location.")
  }
}

async function getTemplateForLocationOrThrow(
  client: PoolClient,
  input: {
    organizationId: string | null
    locationId: string
    templateId: string
  },
) {
  const result = await client.query<{
    id: string
    name: string
    shift_count: string
  }>(
    `select
       template.id,
       template.name,
       count(template_shift.id) as shift_count
     from public.rota_templates template
     left join public.rota_template_shifts template_shift
       on template_shift.template_id = template.id
     where template.id = $1
       and template.location_id = $2
       and (
         ($3::text is null and template.organization_id is null)
         or template.organization_id = $3::text
       )
     group by template.id, template.name
     limit 1`,
    [input.templateId, input.locationId, input.organizationId],
  )
  const template = result.rows[0]

  if (!template) {
    throw new Error("Choose a valid template.")
  }

  if (Number(template.shift_count) === 0) {
    throw new Error("That template does not have any shifts yet.")
  }

  return template
}

async function copyRotaShiftsIntoTemplate(
  client: PoolClient,
  input: {
    rotaId: string
    templateId: string
  },
) {
  const result = await client.query<{ id: string }>(
    `insert into public.rota_template_shifts (
       template_id,
       day_offset,
       zone_id,
       zone_name_snapshot,
       shift_type,
       start_time,
       end_time,
       end_kind,
       split_second_start_time,
       split_second_end_time,
       sort_order
     )
     select
       $2,
       (shift.day_date::date - rota.week_start::date)::integer,
       shift.zone_id,
       shift.zone_name_snapshot,
       shift.shift_type,
       shift.start_time,
       shift.end_time,
       shift.end_kind,
       shift.split_second_start_time,
       shift.split_second_end_time,
       row_number() over (
         order by shift.day_date asc, shift.start_time asc, shift.created_at asc
       )::integer
     from public.rota_shifts shift
     join public.rotas rota on rota.id = shift.rota_id
     where shift.rota_id = $1
       and (shift.day_date::date - rota.week_start::date) between 0 and 6
     returning id`,
    [input.rotaId, input.templateId],
  )

  return result.rows.length
}

async function replaceRotaShiftsFromTemplate(
  client: PoolClient,
  input: {
    organizationId: string | null
    rotaId: string
    templateId: string
    weekStart: string
  },
) {
  await client.query(
    `delete from public.rota_shift_assignments
     where rota_shift_id in (
       select id from public.rota_shifts where rota_id = $1
     )`,
    [input.rotaId],
  )
  await client.query(`delete from public.rota_shifts where rota_id = $1`, [
    input.rotaId,
  ])
  const result = await client.query<{ id: string }>(
    `insert into public.rota_shifts (
       rota_id,
       organization_id,
       day_date,
       zone_id,
       zone_name_snapshot,
       shift_type,
       start_time,
       end_time,
       end_kind,
       split_second_start_time,
       split_second_end_time
     )
     select
       $1,
       $2,
       ($3::date + template_shift.day_offset),
       template_shift.zone_id,
       template_shift.zone_name_snapshot,
       template_shift.shift_type,
       template_shift.start_time,
       template_shift.end_time,
       template_shift.end_kind,
       template_shift.split_second_start_time,
       template_shift.split_second_end_time
     from public.rota_template_shifts template_shift
     where template_shift.template_id = $4
     order by template_shift.day_offset asc, template_shift.sort_order asc
     returning id`,
    [input.rotaId, input.organizationId, input.weekStart, input.templateId],
  )

  return result.rows.length
}

export {
  applyRotaTemplateToRota,
  assertTemplateNameAvailable,
  createRotaTemplateFromRota,
  getTemplateForLocationOrThrow,
  overrideRotaTemplateFromRota,
  replaceRotaShiftsFromTemplate,
}
