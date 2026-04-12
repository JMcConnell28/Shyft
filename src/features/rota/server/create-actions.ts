import { addDays, parseISO } from "date-fns"
import { createServerFn } from "@tanstack/react-start"

import type { RotaCreationPreview } from "@/features/rota/types"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import {
  createRotaDialogSchema,
  duplicateRotaSchema,
  normalizeWeekStart,
  previewRotaCreationSchema,
  toIsoDate,
} from "@/lib/rota-schemas"
import { createSupabaseServerClient } from "@/lib/supabase"
import {
  assertSupabaseSuccess,
  getRequiredSupabaseRow,
} from "@/lib/supabase-errors"

import { ensureLocationAccessOrThrow } from "@/features/rota/server/access"
import { createDraftRotaRecord } from "@/features/rota/server/draft-actions"
import {
  findExistingRotaByWeek,
  getOrganizationSlugById,
  getPreviousPublishedForLocation,
  getTemplatesForLocation,
} from "@/features/rota/server/lookups"
import { coerceNumber } from "@/features/rota/utils/week-utils"

const previewRotaCreation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => previewRotaCreationSchema.parse(input))
  .handler(async ({ data }): Promise<RotaCreationPreview> => {
    const { requireVerifiedSessionOrThrow } = await import(
      "@/features/rota/server/request-session"
    )
    const { session } = await requireVerifiedSessionOrThrow()
    const organizationId = session.session.activeOrganizationId

    if (!organizationId) {
      throw new Error("Choose an organization before creating a rota.")
    }

    const role = await requireOrgPermission({
      organizationId,
      userId: session.user.id,
      permissions: {
        rota: ["create"],
      },
      errorMessage: "You do not have permission to create rotas.",
    })

    const normalizedWeekStart = normalizeWeekStart(data.weekStart)
    await ensureLocationAccessOrThrow(
      organizationId,
      session.user.id,
      data.locationId,
      role,
    )

    const [existing, previousPublished, templates] = await Promise.all([
      findExistingRotaByWeek(organizationId, data.locationId, normalizedWeekStart),
      getPreviousPublishedForLocation(
        organizationId,
        data.locationId,
        normalizedWeekStart,
      ),
      getTemplatesForLocation(organizationId, data.locationId),
    ])

    return {
      existingRota: existing
        ? {
            id: existing.id,
          }
        : null,
      previousPublished,
      templates,
    }
  })

const createRotaDraft = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createRotaDialogSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireVerifiedSessionOrThrow } = await import(
      "@/features/rota/server/request-session"
    )
    const { session } = await requireVerifiedSessionOrThrow()
    const organizationId = session.session.activeOrganizationId

    if (!organizationId) {
      throw new Error("Choose an organization before creating a rota.")
    }

    const role = await requireOrgPermission({
      organizationId,
      userId: session.user.id,
      permissions: {
        rota: ["create"],
      },
      errorMessage: "You do not have permission to create rotas.",
    })
    const normalizedWeekStart = normalizeWeekStart(data.weekStart)
    const { location } = await ensureLocationAccessOrThrow(
      organizationId,
      session.user.id,
      data.locationId,
      role,
    )
    const orgSlug = await getOrganizationSlugById(organizationId)

    if (!orgSlug) {
      throw new Error("We could not find that organization workspace.")
    }

    return createDraftRotaRecord({
      organizationId,
      userId: session.user.id,
      locationId: location.id,
      locationSlug: location.slug,
      orgSlug,
      weekStart: normalizedWeekStart,
      sourceType: data.sourceType,
      templateId: data.templateId,
    })
  })

const duplicateRotaToNextWeek = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => duplicateRotaSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireVerifiedSessionOrThrow } = await import(
      "@/features/rota/server/request-session"
    )
    const { session } = await requireVerifiedSessionOrThrow()
    const organizationId = session.session.activeOrganizationId

    if (!organizationId) {
      throw new Error("Choose an organization before duplicating a rota.")
    }

    const role = await requireOrgPermission({
      organizationId,
      userId: session.user.id,
      permissions: {
        rota: ["create"],
      },
      errorMessage: "You do not have permission to duplicate rotas.",
    })
    const supabase = createSupabaseServerClient()
    const sourceResult = await supabase
      .from("rotas")
      .select(
        "location_id, week_start, note, shift_count, scheduled_hours, scheduled_staff_count",
      )
      .eq("id", data.rotaId)
      .eq("organization_id", organizationId)
      .maybeSingle()

    assertSupabaseSuccess(sourceResult.error, "That rota could not be found.")
    const source = sourceResult.data

    if (!source) {
      throw new Error("That rota could not be found.")
    }

    const { location } = await ensureLocationAccessOrThrow(
      organizationId,
      session.user.id,
      source.location_id,
      role,
    )
    const orgSlug = await getOrganizationSlugById(organizationId)

    if (!orgSlug) {
      throw new Error("We could not find that organization workspace.")
    }

    const nextWeekStart = toIsoDate(addDays(parseISO(source.week_start), 7))
    const existing = await findExistingRotaByWeek(
      organizationId,
      source.location_id,
      nextWeekStart,
    )

    if (existing) {
      return {
        wasExisting: true,
        target: {
          orgSlug,
          locationSlug: location.slug,
          rotaId: existing.id,
        },
      }
    }

    const duplicateInsertResult = await supabase
      .from("rotas")
      .insert({
        organization_id: organizationId,
        location_id: source.location_id,
        week_start: nextWeekStart,
        status: "draft",
        note: source.note,
        shift_count: source.shift_count,
        scheduled_hours: coerceNumber(source.scheduled_hours),
        scheduled_staff_count: source.scheduled_staff_count,
        created_by: session.user.id,
        source_type: "duplicate",
        source_rota_id: data.rotaId,
      })
      .select("id")
      .single()

    assertSupabaseSuccess(
      duplicateInsertResult.error,
      "We could not duplicate that rota.",
    )
    const duplicatedRota = getRequiredSupabaseRow(
      duplicateInsertResult.data,
      "We could not duplicate that rota.",
    )

    return {
      wasExisting: false,
      target: {
        orgSlug,
        locationSlug: location.slug,
        rotaId: duplicatedRota.id,
      },
    }
  })

export { createRotaDraft, duplicateRotaToNextWeek, previewRotaCreation }

