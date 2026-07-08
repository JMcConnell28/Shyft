import type { PoolClient } from "pg"

import type {
  AnnouncementScopeInput,
  AnnouncementTargetScope,
} from "@/features/announcements/types"
import type { AnnouncementFormInput } from "@/features/announcements/schemas/announcement-schemas"
import { getAnnouncementsPageData } from "@/features/announcements/server/queries"
import {
  getAnnouncementContext,
  listAnnouncementManageableLocations,
  withAnnouncementTransaction,
  type AnnouncementContext,
} from "@/features/announcements/server/shared"
import { canManageAnnouncementTargets } from "@/features/announcements/utils/announcement-rules"
import { getDatabase } from "@/lib/db"

type AnnouncementMutationInput = AnnouncementScopeInput & AnnouncementFormInput

type ExistingAnnouncementRow = {
  id: string
  status: "active" | "archived"
  target_scope: AnnouncementTargetScope
}

async function createAnnouncement(input: AnnouncementMutationInput) {
  const context = await getAnnouncementContext(input)
  const targetLocationIds = await assertCanManageTargets(context, input)

  return withAnnouncementTransaction(async (client) => {
    const result = await client.query<{ id: string }>(
      `insert into public.announcements (
         organization_id,
         author_user_id,
         title,
         body,
         target_scope
       ) values ($1, $2, $3, $4, $5)
       returning id`,
      [
        context.organizationId,
        context.userId,
        input.title,
        input.body,
        input.targetScope,
      ],
    )
    const announcementId = result.rows[0]?.id

    if (!announcementId) {
      throw new Error("We could not create that announcement.")
    }

    await replaceAnnouncementLocations(client, announcementId, targetLocationIds)
    await markRead(client, announcementId, context.userId)

    return { announcementId }
  })
}

async function updateAnnouncement(
  input: AnnouncementMutationInput & { announcementId: string },
) {
  const context = await getAnnouncementContext(input)
  await assertCanManageAnnouncement(context, input.announcementId)
  const targetLocationIds = await assertCanManageTargets(context, input)

  await withAnnouncementTransaction(async (client) => {
    await client.query(
      `update public.announcements
       set title = $3,
           body = $4,
           target_scope = $5,
           updated_at = timezone('utc', now())
       where id = $1::uuid
         and organization_id = $2
         and status = 'active'`,
      [
        input.announcementId,
        context.organizationId,
        input.title,
        input.body,
        input.targetScope,
      ],
    )
    await replaceAnnouncementLocations(
      client,
      input.announcementId,
      targetLocationIds,
    )
    await markRead(client, input.announcementId, context.userId)
  })

  return { announcementId: input.announcementId }
}

async function archiveAnnouncement(
  input: AnnouncementScopeInput & { announcementId: string },
) {
  const context = await getAnnouncementContext(input)
  await assertCanManageAnnouncement(context, input.announcementId)

  await getDatabase().query(
    `update public.announcements
     set status = 'archived',
         archived_at = timezone('utc', now()),
         updated_at = timezone('utc', now())
     where id = $1::uuid
       and organization_id = $2
       and status = 'active'`,
    [input.announcementId, context.organizationId],
  )

  return { announcementId: input.announcementId }
}

async function markAnnouncementRead(
  input: AnnouncementScopeInput & { announcementId: string },
) {
  const context = await getAnnouncementContext(input)
  const pageData = await getAnnouncementsPageData({
    locationId: input.locationId,
    organizationId: input.organizationId,
    userId: input.userId,
  })

  if (
    !pageData.announcements.some(
      (announcement) => announcement.id === input.announcementId,
    )
  ) {
    throw new Error("That announcement could not be found.")
  }

  await getDatabase().query(
    `insert into public.announcement_reads (announcement_id, user_id, read_at)
     values ($1::uuid, $2, timezone('utc', now()))
     on conflict (announcement_id, user_id)
     do update set read_at = excluded.read_at`,
    [input.announcementId, context.userId],
  )

  return { announcementId: input.announcementId }
}

async function markAllAnnouncementsRead(input: AnnouncementScopeInput) {
  const context = await getAnnouncementContext(input)
  const pageData = await getAnnouncementsPageData({
    locationId: input.locationId,
    organizationId: input.organizationId,
    userId: input.userId,
  })
  const unreadIds = pageData.announcements
    .filter((announcement) => announcement.isUnread)
    .map((announcement) => announcement.id)

  if (unreadIds.length === 0) {
    return { readCount: 0 }
  }

  await getDatabase().query(
    `insert into public.announcement_reads (announcement_id, user_id, read_at)
     select announcement_id, $2, timezone('utc', now())
     from unnest($1::uuid[]) announcement_id
     on conflict (announcement_id, user_id)
     do update set read_at = excluded.read_at`,
    [unreadIds, context.userId],
  )

  return { readCount: unreadIds.length }
}

async function assertCanManageTargets(
  context: AnnouncementContext,
  input: AnnouncementFormInput,
) {
  const manageableLocations = await listAnnouncementManageableLocations(context)
  const manageableLocationIds = manageableLocations.map((location) => location.id)
  const targetLocationIds =
    input.targetScope === "organization"
      ? []
      : Array.from(new Set(input.targetLocationIds))

  if (
    !canManageAnnouncementTargets({
      manageableLocationIds,
      role: context.role,
      targetLocationIds,
      targetScope: input.targetScope,
    })
  ) {
    throw new Error("You do not have permission to target those locations.")
  }

  return targetLocationIds
}

async function assertCanManageAnnouncement(
  context: AnnouncementContext,
  announcementId: string,
) {
  const announcement = await getExistingAnnouncement(context, announcementId)

  if (announcement.status !== "active") {
    throw new Error("Archived announcements cannot be changed.")
  }

  if (context.role === "owner" || context.role === "admin") {
    return
  }

  if (context.role !== "manager" || announcement.target_scope !== "locations") {
    throw new Error("You do not have permission to manage that announcement.")
  }

  const [manageableLocations, targetLocationIds] = await Promise.all([
    listAnnouncementManageableLocations(context),
    listAnnouncementTargetIds(announcementId),
  ])
  const manageableLocationIds = new Set(
    manageableLocations.map((location) => location.id),
  )

  if (
    targetLocationIds.length === 0 ||
    !targetLocationIds.every((locationId) => manageableLocationIds.has(locationId))
  ) {
    throw new Error("You do not have permission to manage that announcement.")
  }
}

async function getExistingAnnouncement(
  context: AnnouncementContext,
  announcementId: string,
) {
  const result = await getDatabase().query<ExistingAnnouncementRow>(
    `select id, status, target_scope
     from public.announcements
     where id = $1::uuid
       and organization_id = $2
     limit 1`,
    [announcementId, context.organizationId],
  )
  const announcement = result.rows.at(0)

  if (!announcement) {
    throw new Error("That announcement could not be found.")
  }

  return announcement
}

async function listAnnouncementTargetIds(announcementId: string) {
  const result = await getDatabase().query<{ location_id: string }>(
    `select location_id
     from public.announcement_locations
     where announcement_id = $1::uuid`,
    [announcementId],
  )

  return result.rows.map((row) => row.location_id)
}

async function replaceAnnouncementLocations(
  client: PoolClient,
  announcementId: string,
  locationIds: string[],
) {
  await client.query(
    `delete from public.announcement_locations
     where announcement_id = $1::uuid`,
    [announcementId],
  )

  if (locationIds.length === 0) {
    return
  }

  await client.query(
    `insert into public.announcement_locations (announcement_id, location_id)
     select $1::uuid, location_id
     from unnest($2::uuid[]) location_id`,
    [announcementId, locationIds],
  )
}

async function markRead(
  client: PoolClient,
  announcementId: string,
  userId: string,
) {
  await client.query(
    `insert into public.announcement_reads (announcement_id, user_id, read_at)
     values ($1::uuid, $2, timezone('utc', now()))
     on conflict (announcement_id, user_id)
     do update set read_at = excluded.read_at`,
    [announcementId, userId],
  )
}

export {
  archiveAnnouncement,
  createAnnouncement,
  markAllAnnouncementsRead,
  markAnnouncementRead,
  updateAnnouncement,
}
