import { describe, expect, it } from "vitest"

import { getAnnouncementPushPreview } from "@/features/announcements/utils/announcement-push-preview"
import { pushPayloadSchema } from "@/features/push-notifications/schemas/push-schemas"

describe("announcement push preview", () => {
  it("keeps short announcement contents readable on one line", () => {
    expect(getAnnouncementPushPreview("  Team meeting\n\n at 10am.  ")).toBe(
      "Team meeting at 10am."
    )
  })

  it("keeps a body at the limit intact", () => {
    const body = "a".repeat(240)
    expect(getAnnouncementPushPreview(body)).toBe(body)
  })

  it("truncates long announcements to a valid push payload with an ellipsis", () => {
    const body = getAnnouncementPushPreview("a".repeat(4000))
    expect(body).toBe(`${"a".repeat(239)}…`)
    expect(
      pushPayloadSchema.safeParse({ title: "Team update", body }).success
    ).toBe(true)
  })

  it("does not split emoji at the truncation boundary", () => {
    const body = getAnnouncementPushPreview(`${"a".repeat(238)}😀 more text`)
    expect(body).toBe(`${"a".repeat(238)}…`)
  })
})
