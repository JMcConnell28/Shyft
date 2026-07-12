import { describe, expect, it } from "vitest"

import {
  canManageAnnouncementTargets,
  isAnnouncementUnread,
} from "@/features/announcements/utils/announcement-rules"

describe("announcement rules", () => {
  it("does not count the author as unread", () => {
    expect(
      isAnnouncementUnread({
        authorUserId: "user-1",
        readAt: null,
        status: "active",
        userId: "user-1",
      })
    ).toBe(false)
  })

  it("counts active unread announcements for other users", () => {
    expect(
      isAnnouncementUnread({
        authorUserId: "user-1",
        readAt: null,
        status: "active",
        userId: "user-2",
      })
    ).toBe(true)
  })

  it("allows managers to target only manageable locations", () => {
    expect(
      canManageAnnouncementTargets({
        manageableLocationIds: ["loc-1"],
        role: "manager",
        targetLocationIds: ["loc-1"],
        targetScope: "locations",
      })
    ).toBe(true)

    expect(
      canManageAnnouncementTargets({
        manageableLocationIds: ["loc-1"],
        role: "manager",
        targetLocationIds: ["loc-2"],
        targetScope: "locations",
      })
    ).toBe(false)
  })

  it("does not allow managers to post organization-wide announcements", () => {
    expect(
      canManageAnnouncementTargets({
        manageableLocationIds: ["loc-1"],
        role: "manager",
        targetLocationIds: [],
        targetScope: "organization",
      })
    ).toBe(false)
  })
})
