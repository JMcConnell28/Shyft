import "@tanstack/react-start/server-only"

import { getOrganizationBillingAccess } from "@/features/billing/server/billing-accounts"
import {
  getLocationEntitlement,
  listLocationEntitlements,
} from "@/features/billing/server/entitlements"
import { ensureWorkspaceTrial } from "@/features/billing/server/trials"
import { isWorkspaceBillingBlocked } from "@/features/billing/utils/billing-access"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { getDatabase } from "@/lib/db"

const VIEW_ONLY_MESSAGE =
  "This workspace is currently view-only. Ask a manager for help."

async function requireWorkspaceWriteAccess(input: {
  locationId?: string | null
  organizationId?: string | null
  userId?: string
}): Promise<void> {
  const { session } = await requireVerifiedSessionOrThrow()
  if (input.userId && input.userId !== session.user.id) {
    throw new Error("Your workspace session is no longer valid.")
  }

  if (input.locationId) {
    const entitlement = await getLocationEntitlement(input.locationId)
    if (!entitlement.canWrite) throw new Error(VIEW_ONLY_MESSAGE)
    return
  }

  if (!input.organizationId) throw new Error("Choose a workspace.")

  const locationResult = await getDatabase().query<{ id: string }>(
    `select id from public.locations where organization_id = $1`,
    [input.organizationId]
  )
  if (locationResult.rows.length > 0) {
    const entitlements = await listLocationEntitlements(
      locationResult.rows.map((location) => location.id)
    )
    if (entitlements.some((entitlement) => !entitlement.canWrite)) {
      throw new Error(VIEW_ONLY_MESSAGE)
    }
    return
  }

  const [trial, billing] = await Promise.all([
    ensureWorkspaceTrial({ organizationId: input.organizationId }),
    getOrganizationBillingAccess(input.organizationId),
  ])
  if (isWorkspaceBillingBlocked({ trial, billing })) {
    throw new Error(VIEW_ONLY_MESSAGE)
  }
}

export { requireWorkspaceWriteAccess, VIEW_ONLY_MESSAGE }
