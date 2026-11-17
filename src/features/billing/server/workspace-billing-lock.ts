import "@tanstack/react-start/server-only"

import { acquireBillingProcessingLock } from "@/features/billing/server/processing-locks"

async function withWorkspaceBillingLock<T>(
  organizationId: string | null,
  operation: (assertHeld: () => void) => Promise<T>
): Promise<T> {
  if (!organizationId) return operation(() => {})

  const lock = await acquireBillingProcessingLock("workspace", organizationId)
  if (!lock)
    throw new Error("Billing is currently updating. Try again shortly.")

  try {
    return await operation(lock.assertHeld)
  } finally {
    await lock.release()
  }
}

export { withWorkspaceBillingLock }
