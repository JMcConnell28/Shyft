import { describe, expect, it } from "vitest"

import { announcementFormSchema } from "@/features/announcements/schemas/announcement-schemas"

const validAnnouncement = {
  body: "Choose the best time for the team meeting.",
  isPinned: true,
  pollOptions: ["Before service", "After service"],
  targetLocationIds: [],
  targetScope: "organization" as const,
  title: "Team meeting poll",
}

describe("announcementFormSchema", () => {
  it("accepts a pinned announcement with a poll", () => {
    expect(announcementFormSchema.safeParse(validAnnouncement).success).toBe(
      true
    )
  })

  it("requires at least two poll options", () => {
    const result = announcementFormSchema.safeParse({
      ...validAnnouncement,
      pollOptions: ["Only option"],
    })

    expect(result.success).toBe(false)
  })

  it("rejects duplicate poll options regardless of case", () => {
    const result = announcementFormSchema.safeParse({
      ...validAnnouncement,
      pollOptions: ["Morning", "morning"],
    })

    expect(result.success).toBe(false)
  })
})
