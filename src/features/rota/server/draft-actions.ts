import type {
  CreateDraftRotaRecordInput,
  CreateDraftRotaRecordResult,
} from "@/features/rota/types"
import { createSupabaseServerClient } from "@/lib/supabase"
import {
  assertSupabaseSuccess,
  getRequiredSupabaseRow,
} from "@/lib/supabase-errors"

import { findExistingRotaByWeek } from "@/features/rota/server/lookups"
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
  const existing = await findExistingRotaByWeek(organizationId, locationId, weekStart)

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
    const sourceResult = await supabase
      .from("rotas")
      .select("id, note, shift_count, scheduled_hours, scheduled_staff_count")
      .eq("organization_id", organizationId)
      .eq("location_id", locationId)
      .eq("status", "published")
      .lt("week_start", weekStart)
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle()

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
    const templateResult = await supabase
      .from("rota_templates")
      .select("id, description")
      .eq("organization_id", organizationId)
      .eq("id", templateId ?? "")
      .or(`location_id.is.null,location_id.eq.${locationId}`)
      .maybeSingle()

    assertSupabaseSuccess(templateResult.error, "Choose a valid template.")
    const template = templateResult.data

    if (!template) {
      throw new Error("Choose a valid template.")
    }

    sourceTemplateId = template.id
    note = template.description
  }

  const insertResult = await supabase
    .from("rotas")
    .insert({
      organization_id: organizationId,
      location_id: locationId,
      week_start: weekStart,
      status: "draft",
      note,
      shift_count: shiftCount,
      scheduled_hours: scheduledHours,
      scheduled_staff_count: scheduledStaffCount,
      created_by: userId,
      source_type: sourceType,
      source_rota_id: sourceRotaId,
      template_id: sourceTemplateId,
    })
    .select("id")
    .single()

  assertSupabaseSuccess(insertResult.error, "We could not create that draft rota.")
  const createdRota = getRequiredSupabaseRow(
    insertResult.data,
    "We could not create that draft rota.",
  )

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

