import type { z } from "zod"

import type { announcementFormSchema } from "@/features/announcements/schemas/announcement-schemas"

type AnnouncementTargetScope = "organization" | "locations"
type AnnouncementStatus = "active" | "archived"

type AnnouncementLocationTarget = {
  id: string
  name: string
}

type AnnouncementPollOption = {
  id: string
  label: string
  position: number
  voteCount: number
}

type AnnouncementPoll = {
  options: Array<AnnouncementPollOption>
  selectedOptionId: string | null
  totalVotes: number
}

type AnnouncementSummary = {
  id: string
  authorName: string
  authorUserId: string
  body: string
  canManage: boolean
  createdAt: string
  isPinned: boolean
  isUnread: boolean
  poll: AnnouncementPoll | null
  publishedAt: string
  readAt: string | null
  status: AnnouncementStatus
  targetLocations: Array<AnnouncementLocationTarget>
  targetScope: AnnouncementTargetScope
  title: string
  updatedAt: string
}

type AnnouncementPageData = {
  announcements: Array<AnnouncementSummary>
  canCreate: boolean
  canTargetOrganization: boolean
  canViewArchived: boolean
  manageableLocations: Array<AnnouncementLocationTarget>
  unreadCount: number
}

type DashboardAnnouncement = Pick<
  AnnouncementSummary,
  | "id"
  | "authorName"
  | "body"
  | "isUnread"
  | "publishedAt"
  | "targetLocations"
  | "targetScope"
  | "title"
>

type DashboardAnnouncements = {
  announcements: Array<DashboardAnnouncement>
  unreadCount: number
}

type AnnouncementScopeInput = {
  includeArchived?: boolean
  locationId?: string
  organizationId?: string
  userId: string
}

export type {
  AnnouncementFormInput,
  AnnouncementLocationTarget,
  AnnouncementPoll,
  AnnouncementPollOption,
  AnnouncementPageData,
  AnnouncementScopeInput,
  AnnouncementStatus,
  AnnouncementSummary,
  AnnouncementTargetScope,
  DashboardAnnouncement,
  DashboardAnnouncements,
}

type AnnouncementFormInput = z.infer<typeof announcementFormSchema>
