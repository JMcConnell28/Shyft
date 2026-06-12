import type {
  CreateDraftRotaRecordInput,
  CreateDraftRotaRecordResult,
} from "@/features/rota/types"
import { getDatabase } from "@/lib/db"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import {
  assertSupabaseSuccess,
} from "@/lib/supabase-errors"

import { findExistingRotaByWeek } from "@/features/rota/server/lookups"
import {
  getTemplateForLocationOrThrow,
  replaceRotaShiftsFromTemplate,
} from "@/features/rota/server/template-actions"
import { coerceNumber } from "@/features/rota/utils/week-utils"

async function createDraftRotaRecord({
  organizationId,
  userId,
  locationId,
  locationSlug,
  orgSlug,
  weekStart,
  sourceType,
  templateId,
}: CreateDraftRotaRecordInput): Promise<CreateDraftRotaRecordResult> {
  const supabase = createSupabaseServerClient()
  const workspaceOrganizationId = organizationId || null
  const existing = await findExistingRotaByWeek(
    workspaceOrganizationId,
    locationId,
    weekStart,
  )

  if (existing) {
    return {
      wasExisting: true,
      target: {
        orgSlug,
        locationSlug,
        rotaId: existing.id,
      },
    }
  }

  let sourceRotaId: string | null = null
  let sourceTemplateId: string | null = null
  let note: string | null = null
  let shiftCount = 0
  let scheduledHours = 0
  let scheduledStaffCount = 0

  if (sourceType === "previous-week" || sourceType === "duplicate") {
    const sourceQuery = supabase
      .from("rotas")
      .select("id, note, shift_count, scheduled_hours, scheduled_staff_count")
      .eq("location_id", locationId)
      .eq("status", "published")
      .lt("week_start", weekStart)
      .order("week_start", { ascending: false })
      .limit(1)
    const sourceResult = await (workspaceOrganizationId
      ? sourceQuery.eq("organization_id", workspaceOrganizationId)
      : sourceQuery.is("organization_id", null)).maybeSingle()

    assertSupabaseSuccess(
      sourceResult.error,
      "We could not load the previous published rota.",
    )
    const source = sourceResult.data

    if (!source && sourceType === "previous-week") {
      throw new Error("There is no previous published rota to copy yet.")
    }

    if (source) {
      sourceRotaId = source.id
      note = source.note
      shiftCount = source.shift_count
      scheduledHours = coerceNumber(source.scheduled_hours)
      scheduledStaffCount = source.scheduled_staff_count
    }
  }

  if (sourceType === "template") {
    if (!templateId) {
      throw new Error("Choose a valid template.")
    }

    const client = await getDatabase().connect()

    try {
      const template = await getTemplateForLocationOrThrow(client, {
        templateId,
        organizationId: workspaceOrganizationId,
        locationId,
      })
      sourceTemplateId = template.id
    } finally {
      client.release()
    }
  }

  const insertResult = await getDatabase().query<{ id: string }>(
    `insert into public.rotas (
       organization_id,
       location_id,
       week_start,
       status,
       note,
       shift_count,
       scheduled_hours,
       scheduled_staff_count,
       created_by,
       source_type,
       source_rota_id,
       template_id
     ) values ($1, $2, $3, 'draft', $4, $5, $6, $7, $8, $9, $10, $11)
     returning id`,
    [
      workspaceOrganizationId,
      locationId,
      weekStart,
      note,
      shiftCount,
      scheduledHours,
      scheduledStaffCount,
      userId,
      sourceType,
      sourceRotaId,
      sourceTemplateId,
    ],
  )
  const createdRota = insertResult.rows[0]

  if (!createdRota) {
    throw new Error("We could not create that draft rota.")
  }

  if (sourceTemplateId) {
    const client = await getDatabase().connect()

    try {
      const templateShiftCount = await replaceRotaShiftsFromTemplate(client, {
        organizationId: workspaceOrganizationId,
        rotaId: createdRota.id,
        templateId: sourceTemplateId,
        weekStart,
      })

      if (templateShiftCount === 0) {
        throw new Error("That template does not have any shifts yet.")
      }

      await client.query(
        `update public.rotas
         set shift_count = $2,
             scheduled_hours = 0,
             scheduled_staff_count = 0,
             updated_at = timezone('utc', now())
         where id = $1`,
        [createdRota.id, templateShiftCount],
      )
    } finally {
      client.release()
    }
  }

  return {
    wasExisting: false,
    target: {
      orgSlug,
      locationSlug,
      rotaId: createdRota.id,
    },
  }
}

export { createDraftRotaRecord }

