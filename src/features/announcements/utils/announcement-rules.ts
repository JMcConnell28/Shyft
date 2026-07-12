import type {
  AnnouncementStatus,
  AnnouncementTargetScope,
} from "@/features/announcements/types"
import type { OrganizationRole } from "@/lib/auth/permissions"

function isAnnouncementUnread(input: {
  authorUserId: string
  readAt: string | null
  status: AnnouncementStatus
  userId: string
}) {
  return (
    input.status === "active" &&
    input.authorUserId !== input.userId &&
    input.readAt === null
  )
}

function canManageAnnouncementTargets(input: {
  manageableLocationIds: Array<string>
  role: OrganizationRole | null
  targetLocationIds: Array<string>
  targetScope: AnnouncementTargetScope
}) {
  if (input.role === "owner" || input.role === "admin") {
    return (
      input.targetScope === "organization" || input.targetLocationIds.length > 0
    )
  }

  if (input.role !== "manager" || input.targetScope !== "locations") {
    return false
  }

  const manageableLocationIds = new Set(input.manageableLocationIds)

  return (
    input.targetLocationIds.length > 0 &&
    input.targetLocationIds.every((locationId) =>
      manageableLocationIds.has(locationId)
    )
  )
}

export { canManageAnnouncementTargets, isAnnouncementUnread }
