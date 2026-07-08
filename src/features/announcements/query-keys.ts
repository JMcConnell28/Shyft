import type { AnnouncementScopeInput } from "@/features/announcements/types"

const announcementQueryKeys = {
  all: ["announcements"] as const,
  dashboard: (input: AnnouncementScopeInput) =>
    [...announcementQueryKeys.all, "dashboard", input] as const,
  page: (input: AnnouncementScopeInput) =>
    [...announcementQueryKeys.all, "page", input] as const,
}

export { announcementQueryKeys }
