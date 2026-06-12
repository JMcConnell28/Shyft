import { createServerFn } from "@tanstack/react-start"

import type { PublishRotaVersionResult } from "@/features/rota/types"
import { getDatabase } from "@/lib/db"
import { publishRotaSchema, updateRotaNoteSchema } from "@/lib/rota-schemas"
import {
  assertSupabaseSuccess,
  getRequiredSupabaseRow,
} from "@/lib/supabase-errors"

import { getOrganizationSlugById } from "@/features/rota/server/lookups"
import { sendRotaPublishedNotifications } from "@/features/rota/server/publish-notifications"
import { requireRotaWriteAccess } from "@/features/rota/server/write-access"

const publishRotaVersion = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => publishRotaSchema.parse(input))
  .handler(async ({ data }): Promise<PublishRotaVersionResult> => {
    const context = await requireRotaWriteAccess({
      rotaId: data.rotaId,
      permission: "publish",
      errorMessage: "You do not have permission to publish rotas.",
    })
    const [workingShiftsResult, workingAssignmentsResult] = await Promise.all([
      context.supabase
        .from("rota_shifts")
        .select(
          "id, day_date, zone_id, zone_name_snapshot, shift_type, start_time, end_time, end_kind, split_second_start_time, split_second_end_time"
        )
        .eq("rota_id", data.rotaId),
      context.supabase
        .from("rota_shift_assignments")
        .select("employee_id, rota_shift_id")
        .in(
          "rota_shift_id",
          (
            await context.supabase
              .from("rota_shifts")
              .select("id")
              .eq("rota_id", data.rotaId)
          ).data?.map((shift) => shift.id) ?? ["00000000-0000-0000-0000-000000000000"]
        ),
    ])

    assertSupabaseSuccess(
      workingShiftsResult.error,
      "We could not load the working rota shifts."
    )
    assertSupabaseSuccess(
      workingAssignmentsResult.error,
      "We could not load the working rota assignments."
    )

    const deleteSnapshotResult = await context.supabase
      .from("rota_published_shifts")
      .delete()
      .eq("rota_id", data.rotaId)

    assertSupabaseSuccess(
      deleteSnapshotResult.error,
      "We could not refresh the published rota snapshot."
    )

    const insertedPublishedShifts = await insertPublishedShiftSnapshots({
      organizationId: context.organizationId,
      rotaId: data.rotaId,
      shifts: workingShiftsResult.data ?? [],
    })
    const publishedShiftIdByWorkingShiftId = new Map(
      insertedPublishedShifts
        .filter(
          (shift): shift is { id: string; working_shift_id: string } =>
            Boolean(shift.working_shift_id)
        )
        .map((shift) => [shift.working_shift_id, shift.id])
    )
    const publishedAssignmentRows = (workingAssignmentsResult.data ?? [])
      .map((assignment) => {
        const publishedShiftId = publishedShiftIdByWorkingShiftId.get(
          assignment.rota_shift_id
        )

        if (!publishedShiftId) {
          return null
        }

        return {
          rota_published_shift_id: publishedShiftId,
          employee_id: assignment.employee_id,
        }
      })
      .filter(
        (
          assignment
        ): assignment is {
          rota_published_shift_id: string
          employee_id: string
        } => Boolean(assignment)
      )

    if (publishedAssignmentRows.length > 0) {
      const insertPublishedAssignmentsResult = await context.supabase
        .from("rota_published_shift_assignments")
        .insert(publishedAssignmentRows)

      assertSupabaseSuccess(
        insertPublishedAssignmentsResult.error,
        "We could not save the published rota assignments."
      )
    }

    const nextPublishedVersion = context.rota.published_version + 1

    const publishQuery = context.supabase
      .from("rotas")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        published_by_user_id: context.userId,
        published_version: nextPublishedVersion,
        published_snapshot_version: nextPublishedVersion,
        has_unpublished_changes: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.rotaId)
      .select("id")
    const publishResult = await (context.organizationId
      ? publishQuery.eq("organization_id", context.organizationId)
      : publishQuery.is("organization_id", null)).single()

    assertSupabaseSuccess(publishResult.error, "We could not publish that rota.")
    getRequiredSupabaseRow(
      publishResult.data,
      "We could not publish that rota.",
    )

    const target = {
      orgSlug: context.organizationId
        ? await getRequiredOrganizationSlug(context.organizationId)
        : context.location.slug,
      isOrganizationWorkspace: Boolean(context.organizationId),
      locationSlug: context.location.slug,
      rotaId: data.rotaId,
    }
    const notificationResult = await sendRotaPublishedNotifications(target)

    return {
      notificationEmailCount: notificationResult.sentCount,
      notificationEmailError: notificationResult.errorMessage,
      target: {
        orgSlug: target.orgSlug,
        locationSlug: target.locationSlug,
        rotaId: target.rotaId,
      },
    }
  })

const updateRotaNote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateRotaNoteSchema.parse(input))
  .handler(async ({ data }) => {
    const context = await requireRotaWriteAccess({
      rotaId: data.rotaId,
      permission: "update",
      errorMessage: "You do not have permission to update rotas.",
    })

    const noteQuery = context.supabase
      .from("rotas")
      .update({
        note: data.note.trim() || null,
        has_unpublished_changes:
          context.rota.status === "published" ? true : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.rotaId)
    const noteResult = await (context.organizationId
      ? noteQuery.eq("organization_id", context.organizationId)
      : noteQuery.is("organization_id", null))

    assertSupabaseSuccess(noteResult.error, "We could not update that rota note.")

    return { success: true }
  })

async function getRequiredOrganizationSlug(organizationId: string) {
  const orgSlug = await getOrganizationSlugById(organizationId)

  if (!orgSlug) {
    throw new Error("We could not find that organization workspace.")
  }

  return orgSlug
}

async function insertPublishedShiftSnapshots({
  organizationId,
  rotaId,
  shifts,
}: {
  organizationId: string | null
  rotaId: string
  shifts: Array<{
    day_date: string
    end_kind: string | null
    end_time: string | null
    id: string
    shift_type: string
    split_second_end_time: string | null
    split_second_start_time: string | null
    start_time: string
    zone_id: string | null
    zone_name_snapshot: string
  }>
}) {
  const database = getDatabase()
  const inserted: Array<{ id: string; working_shift_id: string | null }> = []

  for (const shift of shifts) {
    const result = await database.query<{
      id: string
      working_shift_id: string | null
    }>(
      `insert into public.rota_published_shifts (
         rota_id,
         organization_id,
         working_shift_id,
         day_date,
         zone_id,
         zone_name_snapshot,
         shift_type,
         start_time,
         end_time,
         end_kind,
         split_second_start_time,
         split_second_end_time
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       returning id, working_shift_id`,
      [
        rotaId,
        organizationId,
        shift.id,
        shift.day_date,
        shift.zone_id,
        shift.zone_name_snapshot,
        shift.shift_type,
        shift.start_time,
        shift.end_time,
        shift.end_kind,
        shift.split_second_start_time,
        shift.split_second_end_time,
      ],
    )

    const insertedShift = result.rows[0]

    if (!insertedShift) {
      throw new Error("We could not save the published rota snapshot.")
    }

    inserted.push(insertedShift)
  }

  return inserted
}

export { publishRotaVersion, updateRotaNote }

