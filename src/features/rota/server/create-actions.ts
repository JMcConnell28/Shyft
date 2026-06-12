import { addDays, parseISO } from "date-fns"
import { createServerFn } from "@tanstack/react-start"

import type { RotaCreationPreview } from "@/features/rota/types"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import { getLocationRole, requireLocationPermission } from "@/lib/auth/has-location-permission"
import { getDatabase } from "@/lib/db"
import {
  createRotaDialogSchema,
  duplicateRotaSchema,
  normalizeWeekStart,
  previewRotaCreationSchema,
  toIsoDate,
} from "@/lib/rota-schemas"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import {
  assertSupabaseSuccess,
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
    const organizationId = session.session.activeOrganizationId ?? null
    const role = organizationId
      ? await requireOrgPermission({
          organizationId,
          userId: session.user.id,
          permissions: {
            rota: ["create"],
          },
          errorMessage: "You do not have permission to create rotas.",
        })
      : await requireLocationPermission({
          locationId: data.locationId,
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
    const organizationId = session.session.activeOrganizationId ?? null
    const role = organizationId
      ? await requireOrgPermission({
          organizationId,
          userId: session.user.id,
          permissions: {
            rota: ["create"],
          },
          errorMessage: "You do not have permission to create rotas.",
        })
      : await requireLocationPermission({
          locationId: data.locationId,
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
    const orgSlug = organizationId
      ? await getOrganizationSlugById(organizationId)
      : location.slug

    if (!orgSlug) {
      throw new Error("We could not find that workspace.")
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
    const organizationId = session.session.activeOrganizationId ?? null
    const role = organizationId
      ? await requireOrgPermission({
          organizationId,
          userId: session.user.id,
          permissions: {
            rota: ["create"],
          },
          errorMessage: "You do not have permission to duplicate rotas.",
        })
      : null
    const supabase = createSupabaseServerClient()
    const sourceQuery = supabase
      .from("rotas")
      .select(
        "location_id, week_start, note, shift_count, scheduled_hours, scheduled_staff_count",
      )
      .eq("id", data.rotaId)
    const sourceResult = await (organizationId
      ? sourceQuery.eq("organization_id", organizationId)
      : sourceQuery.is("organization_id", null)).maybeSingle()

    assertSupabaseSuccess(sourceResult.error, "That rota could not be found.")
    const source = sourceResult.data

    if (!source) {
      throw new Error("That rota could not be found.")
    }

    const locationRole =
      role ?? (await getLocationRole(source.location_id, session.user.id))
    const { location } = await ensureLocationAccessOrThrow(
      organizationId,
      session.user.id,
      source.location_id,
      locationRole,
    )
    const orgSlug = organizationId
      ? await getOrganizationSlugById(organizationId)
      : location.slug

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

    const duplicateInsertResult = await getDatabase().query<{ id: string }>(
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
         source_rota_id
       ) values ($1, $2, $3, 'draft', $4, $5, $6, $7, $8, 'duplicate', $9)
       returning id`,
      [
        organizationId,
        source.location_id,
        nextWeekStart,
        source.note,
        source.shift_count,
        coerceNumber(source.scheduled_hours),
        source.scheduled_staff_count,
        session.user.id,
        data.rotaId,
      ],
    )
    const duplicatedRota = duplicateInsertResult.rows[0]

    if (!duplicatedRota) {
      throw new Error("We could not duplicate that rota.")
    }

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

