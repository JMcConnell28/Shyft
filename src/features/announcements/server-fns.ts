import { createServerFn } from "@tanstack/react-start"

import {
  announcementWorkspaceInputSchema,
  archiveAnnouncementInputSchema,
  createAnnouncementInputSchema,
  markAllAnnouncementsReadInputSchema,
  markAnnouncementReadInputSchema,
  updateAnnouncementInputSchema,
  voteAnnouncementPollInputSchema,
} from "@/features/announcements/schemas/announcement-schemas"

const getAnnouncementsPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    announcementWorkspaceInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/announcements/server/queries")
    return module.getAnnouncementsPageData(data)
  })

const getDashboardAnnouncements = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    announcementWorkspaceInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/announcements/server/queries")
    return module.getDashboardAnnouncements(data)
  })

const getHasUnreadAnnouncements = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    announcementWorkspaceInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/announcements/server/queries")
    return module.getHasUnreadAnnouncements(data)
  })

const createAnnouncement = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    createAnnouncementInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/announcements/server/actions")
    return module.createAnnouncement(data)
  })

const updateAnnouncement = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    updateAnnouncementInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/announcements/server/actions")
    return module.updateAnnouncement(data)
  })

const archiveAnnouncement = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    archiveAnnouncementInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/announcements/server/actions")
    return module.archiveAnnouncement(data)
  })

const markAnnouncementRead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    markAnnouncementReadInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/announcements/server/actions")
    return module.markAnnouncementRead(data)
  })

const markAllAnnouncementsRead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    markAllAnnouncementsReadInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/announcements/server/actions")
    return module.markAllAnnouncementsRead(data)
  })

const voteAnnouncementPoll = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    voteAnnouncementPollInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/announcements/server/actions")
    return module.voteAnnouncementPoll(data)
  })

export {
  archiveAnnouncement,
  createAnnouncement,
  getAnnouncementsPageData,
  getDashboardAnnouncements,
  getHasUnreadAnnouncements,
  markAllAnnouncementsRead,
  markAnnouncementRead,
  updateAnnouncement,
  voteAnnouncementPoll,
}
