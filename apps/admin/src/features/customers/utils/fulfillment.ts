import type { UpdateFulfillmentInput } from "../schemas"

type FulfillmentCheck = {
  currentStatus: string
  needsStation: boolean
  hasTag: boolean
  hasAddress: boolean
}

function validateFulfillmentTransition(
  current: FulfillmentCheck,
  next: UpdateFulfillmentInput["status"]
): void {
  const transitions: Partial<Record<string, ReadonlyArray<string>>> = {
    pending: ["pending", "ready", "failed"],
    ready: ["ready", "pending", "shipped", "failed"],
    shipped: ["shipped", "delivered", "failed"],
    delivered: ["delivered"],
    failed: ["failed", "pending", "ready"],
  }
  if (!transitions[current.currentStatus]?.includes(next))
    throw new Error(
      "This setup step is no longer available. Refresh the customer page."
    )
  if (["ready", "shipped"].includes(next) && current.currentStatus !== next) {
    if (!current.needsStation)
      throw new Error(
        "A confirmed payment and an active Time & Attendance add-on are required before dispatch."
      )
    if (!current.hasTag)
      throw new Error(
        "Generate an active NFC tag before marking this station ready."
      )
    if (!current.hasAddress)
      throw new Error(
        "A complete delivery address is required before dispatch."
      )
  }
}
export { validateFulfillmentTransition }
