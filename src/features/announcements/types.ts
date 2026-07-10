type AnnouncementTargetScope = "organization" | "locations"
type AnnouncementStatus = "active" | "archived"

type AnnouncementLocationTarget = {
  id: string
  name: string
}

type AnnouncementSummary = {
  id: string
  authorName: string
  authorUserId: string
  body: string
  canManage: boolean
  createdAt: string
  isUnread: boolean
  publishedAt: string
  readAt: string | null
  status: AnnouncementStatus
  targetLocations: AnnouncementLocationTarget[]
  targetScope: AnnouncementTargetScope
  title: string
  updatedAt: string
}

type AnnouncementPageData = {
  announcements: AnnouncementSummary[]
  canCreate: boolean
  canTargetOrganization: boolean
  canViewArchived: boolean
  manageableLocations: AnnouncementLocationTarget[]
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
  announcements: DashboardAnnouncement[]
  unreadCount: number
}

type AnnouncementScopeInput = {
  includeArchived?: boolean
  locationId?: string
  organizationId?: string
  userId: string
}

export type {
  AnnouncementLocationTarget,
  AnnouncementPageData,
  AnnouncementScopeInput,
  AnnouncementStatus,
  AnnouncementSummary,
  AnnouncementTargetScope,
  DashboardAnnouncement,
  DashboardAnnouncements,
}
