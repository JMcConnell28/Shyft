export * from "./schemas"
export type * from "./types"

const privacyStatusLabels = {
  requested: "Request received",
  in_review: "Being reviewed",
  awaiting_workplace: "Workplace follow-up",
  ready: "Ready to download",
  completed: "Completed",
  expired: "Download expired",
} as const

export { privacyStatusLabels }
