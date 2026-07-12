import type {
  AnnouncementLocationTarget,
  AnnouncementPageData,
  AnnouncementScopeInput,
  AnnouncementSummary,
  DashboardAnnouncements,
} from "@/features/announcements/types"
import { isAnnouncementUnread } from "@/features/announcements/utils/announcement-rules"
import {
  getAnnouncementContext,
  listAnnouncementManageableLocations,
  listAnnouncementVisibleLocationIds,
} from "@/features/announcements/server/shared"
import { getDatabase } from "@/lib/db"

type AnnouncementRow = {
  author_name: string | null
  author_user_id: string
  body: string
  created_at: Date | string
  id: string
  is_pinned: boolean
  location_id: string | null
  location_name: string | null
  published_at: Date | string
  read_at: Date | string | null
  status: "active" | "archived"
  target_scope: "organization" | "locations"
  title: string
  updated_at: Date | string
}

type AnnouncementPollOptionRow = {
  announcement_id: string
  id: string
  is_selected: boolean
  label: string
  position: number
  vote_count: number | string
}

async function getAnnouncementsPageData(
  input: AnnouncementScopeInput
): Promise<AnnouncementPageData> {
  const context = await getAnnouncementContext(input)
  const [manageableLocations, visibleLocationIds] = await Promise.all([
    listAnnouncementManageableLocations(context),
    listAnnouncementVisibleLocationIds(context),
  ])
  const announcements = await listAnnouncements({
    canViewOrganizationAnnouncements:
      context.role === "owner" ||
      context.role === "admin" ||
      context.role === "manager" ||
      visibleLocationIds.length > 0,
    includeArchived: Boolean(input.includeArchived),
    manageableLocationIds: manageableLocations.map((location) => location.id),
    organizationId: context.organizationId,
    scopedLocationId: context.locationId,
    userId: context.userId,
    visibleLocationIds,
    viewerIsOrgAdmin: context.role === "owner" || context.role === "admin",
  })
  const canTargetOrganization =
    context.role === "owner" || context.role === "admin"

  return {
    announcements,
    canCreate: canTargetOrganization || manageableLocations.length > 0,
    canTargetOrganization,
    canViewArchived:
      context.role === "owner" ||
      context.role === "admin" ||
      context.role === "manager",
    manageableLocations,
    unreadCount: announcements.filter((announcement) => announcement.isUnread)
      .length,
  }
}

async function getDashboardAnnouncements(
  input: AnnouncementScopeInput
): Promise<DashboardAnnouncements> {
  const pageData = await getAnnouncementsPageData({
    ...input,
    includeArchived: false,
  })
  const announcements = pageData.announcements
    .slice(0, 3)
    .map((announcement) => ({
      id: announcement.id,
      authorName: announcement.authorName,
      body: announcement.body,
      isUnread: announcement.isUnread,
      publishedAt: announcement.publishedAt,
      targetLocations: announcement.targetLocations,
      targetScope: announcement.targetScope,
      title: announcement.title,
    }))

  return {
    announcements,
    unreadCount: pageData.unreadCount,
  }
}

async function getHasUnreadAnnouncements(input: AnnouncementScopeInput) {
  const dashboard = await getDashboardAnnouncements(input)

  return dashboard.unreadCount > 0
}

async function listAnnouncements(input: {
  canViewOrganizationAnnouncements: boolean
  includeArchived: boolean
  manageableLocationIds: Array<string>
  organizationId: string
  scopedLocationId: string | null
  userId: string
  visibleLocationIds: Array<string>
  viewerIsOrgAdmin: boolean
}) {
  const result = await getDatabase().query<AnnouncementRow>(
    `select announcement.id,
            announcement.author_user_id,
            coalesce(author.name, author.email, 'Team member') as author_name,
            announcement.title,
            announcement.body,
            announcement.is_pinned,
            announcement.target_scope,
            announcement.status,
            announcement.published_at,
            announcement.created_at,
            announcement.updated_at,
            read_state.read_at,
            target_location.id as location_id,
            target_location.name as location_name
     from public.announcements announcement
     left join public."user" author on author.id = announcement.author_user_id
     left join public.announcement_reads read_state
       on read_state.announcement_id = announcement.id
      and read_state.user_id = $1
     left join public.announcement_locations target
       on target.announcement_id = announcement.id
     left join public.locations target_location on target_location.id = target.location_id
     where announcement.organization_id = $2
       and (
         (
           announcement.status = 'active'
           and (
             (
               announcement.target_scope = 'organization'
               and $8::boolean
             )
             or exists (
               select 1
               from public.announcement_locations visible_target
               where visible_target.announcement_id = announcement.id
                 and visible_target.location_id = any($3::uuid[])
                 and (
                   $7::uuid is null
                   or visible_target.location_id = $7::uuid
                 )
             )
           )
         )
         or (
           $5::boolean
           and announcement.status = 'archived'
           and (
             $6::boolean
             or exists (
               select 1
               from public.announcement_locations manageable_target
               where manageable_target.announcement_id = announcement.id
                 and manageable_target.location_id = any($4::uuid[])
             )
           )
         )
       )
       and (
         $7::uuid is null
         or announcement.target_scope = 'organization'
         or exists (
           select 1
           from public.announcement_locations scoped_target
           where scoped_target.announcement_id = announcement.id
             and scoped_target.location_id = $7::uuid
         )
       )
     order by case when announcement.status = 'active' and announcement.is_pinned then 0 else 1 end,
              case
                when announcement.status = 'active'
                 and announcement.author_user_id <> $1
                 and read_state.read_at is null
                then 0
                else 1
              end,
              announcement.published_at desc,
              announcement.created_at desc`,
    [
      input.userId,
      input.organizationId,
      input.visibleLocationIds,
      input.manageableLocationIds,
      input.includeArchived,
      input.viewerIsOrgAdmin,
      input.scopedLocationId,
      input.canViewOrganizationAnnouncements,
    ]
  )

  const announcements = mapAnnouncementRows(result.rows, {
    manageableLocationIds: input.manageableLocationIds,
    userId: input.userId,
    viewerIsOrgAdmin: input.viewerIsOrgAdmin,
  })
  const polls = await listAnnouncementPolls(
    announcements.map((announcement) => announcement.id),
    input.userId
  )

  return announcements.map((announcement) => ({
    ...announcement,
    poll: polls.get(announcement.id) ?? null,
  }))
}

function mapAnnouncementRows(
  rows: Array<AnnouncementRow>,
  input: {
    manageableLocationIds: Array<string>
    userId: string
    viewerIsOrgAdmin: boolean
  }
) {
  const announcementsById = new Map<string, AnnouncementSummary>()

  for (const row of rows) {
    const existing = announcementsById.get(row.id)
    const announcement =
      existing ??
      ({
        id: row.id,
        authorName: row.author_name ?? "Team member",
        authorUserId: row.author_user_id,
        body: row.body,
        canManage: false,
        createdAt: toIsoString(row.created_at),
        isPinned: row.is_pinned,
        isUnread: isAnnouncementUnread({
          authorUserId: row.author_user_id,
          readAt: row.read_at ? toIsoString(row.read_at) : null,
          status: row.status,
          userId: input.userId,
        }),
        publishedAt: toIsoString(row.published_at),
        poll: null,
        readAt: row.read_at ? toIsoString(row.read_at) : null,
        status: row.status,
        targetLocations: [],
        targetScope: row.target_scope,
        title: row.title,
        updatedAt: toIsoString(row.updated_at),
      } satisfies AnnouncementSummary)

    if (!existing) {
      announcementsById.set(row.id, announcement)
    }

    if (row.location_id && row.location_name) {
      addTargetLocation(announcement.targetLocations, {
        id: row.location_id,
        name: row.location_name,
      })
    }
  }

  const manageableLocationIds = new Set(input.manageableLocationIds)

  return Array.from(announcementsById.values()).map((announcement) => ({
    ...announcement,
    canManage:
      input.viewerIsOrgAdmin ||
      (announcement.targetScope === "locations" &&
        announcement.targetLocations.length > 0 &&
        announcement.targetLocations.every((location) =>
          manageableLocationIds.has(location.id)
        )),
  }))
}

async function listAnnouncementPolls(
  announcementIds: Array<string>,
  userId: string
) {
  if (announcementIds.length === 0) {
    return new Map<string, AnnouncementSummary["poll"]>()
  }

  const result = await getDatabase().query<AnnouncementPollOptionRow>(
    `select poll_option.announcement_id,
            poll_option.id,
            poll_option.label,
            poll_option.position,
            count(vote.user_id)::integer as vote_count,
            exists (
              select 1
              from public.announcement_poll_votes viewer_vote
              where viewer_vote.announcement_id = poll_option.announcement_id
                and viewer_vote.option_id = poll_option.id
                and viewer_vote.user_id = $2
            ) as is_selected
     from public.announcement_poll_options poll_option
     left join public.announcement_poll_votes vote
       on vote.announcement_id = poll_option.announcement_id
      and vote.option_id = poll_option.id
     where poll_option.announcement_id = any($1::uuid[])
     group by poll_option.announcement_id,
              poll_option.id,
              poll_option.label,
              poll_option.position
     order by poll_option.announcement_id, poll_option.position`,
    [announcementIds, userId]
  )
  const polls = new Map<string, NonNullable<AnnouncementSummary["poll"]>>()

  for (const row of result.rows) {
    const poll = polls.get(row.announcement_id) ?? {
      options: [],
      selectedOptionId: null,
      totalVotes: 0,
    }
    const voteCount = Number(row.vote_count)

    poll.options.push({
      id: row.id,
      label: row.label,
      position: row.position,
      voteCount,
    })
    poll.totalVotes += voteCount

    if (row.is_selected) {
      poll.selectedOptionId = row.id
    }

    polls.set(row.announcement_id, poll)
  }

  return polls
}

function addTargetLocation(
  locations: Array<AnnouncementLocationTarget>,
  location: AnnouncementLocationTarget
) {
  if (locations.some((item) => item.id === location.id)) {
    return
  }

  locations.push(location)
}

function toIsoString(value: Date | string) {
  return new Date(value).toISOString()
}

export {
  getAnnouncementsPageData,
  getDashboardAnnouncements,
  getHasUnreadAnnouncements,
}
