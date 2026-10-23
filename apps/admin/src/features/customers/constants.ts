import type { CustomerStage } from "./types"

const customerStageLabels: Record<CustomerStage, string> = {
  onboarding: "Onboarding",
  trial: "Trial",
  trial_expired: "Trial ended",
  active: "Paid",
  past_due: "Payment overdue",
  canceled: "Canceled",
  unpaid: "Unpaid",
  incomplete: "Payment incomplete",
  paused: "Paused",
  incomplete_expired: "Payment expired",
}
const fulfillmentLabels = {
  pending: "Needs setup",
  ready: "Ready to send",
  shipped: "Sent",
  delivered: "Delivered",
  failed: "Needs attention",
} as const

export { customerStageLabels, fulfillmentLabels }
