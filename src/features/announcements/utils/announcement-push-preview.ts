import { PUSH_BODY_MAX_LENGTH } from "@/features/push-notifications/constants/push-limits"

function getAnnouncementPushPreview(body: string): string {
  const text = body.replace(/\s+/gu, " ").trim()
  if (text.length <= PUSH_BODY_MAX_LENGTH) return text

  const preview = text
    .slice(0, PUSH_BODY_MAX_LENGTH - 1)
    .replace(/[\uD800-\uDBFF]$/u, "")
    .trimEnd()

  return `${preview}…`
}

export { getAnnouncementPushPreview }
