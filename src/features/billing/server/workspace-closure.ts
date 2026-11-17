import "@tanstack/react-start/server-only"

import {
  cancelWorkspaceRenewal,
  settleWorkspaceBillingForRemoval,
} from "@/features/billing/server/workspace-closure-billing"
import { withWorkspaceBillingLock } from "@/features/billing/server/workspace-billing-lock"
import { readOrganizationMembershipRole } from "@/lib/auth/server/organization-membership"
import { getDatabase } from "@/lib/db"

async function requireOrganizationOwner(
  organizationId: string,
  userId: string
) {
  if (
    (await readOrganizationMembershipRole(organizationId, userId)) !== "owner"
  ) {
    throw new Error("Only the organisation owner has permission to do this.")
  }
}

async function cancelSubscriptionAsOwner(
  organizationId: string,
  userId: string
) {
  return withWorkspaceBillingLock(organizationId, async (assertHeld) => {
    await requireOrganizationOwner(organizationId, userId)
    return cancelWorkspaceRenewal(organizationId, assertHeld)
  })
}

async function removeOrganizationAsOwner(input: {
  organizationId: string
  userId: string
  confirmationName: string
}): Promise<void> {
  const { organizationId, userId, confirmationName } = input
  await withWorkspaceBillingLock(organizationId, async (assertHeld) => {
    await requireOrganizationOwner(organizationId, userId)
    await confirmOrganizationName(organizationId, confirmationName)
    await assertNoPendingStationPurchase(organizationId)
    await settleWorkspaceBillingForRemoval(organizationId, assertHeld)
    assertHeld()
    await deleteConfirmedOrganization(organizationId, userId, confirmationName)
  })
}

async function confirmOrganizationName(
  organizationId: string,
  confirmationName: string
) {
  const result = await getDatabase().query(
    `select 1 from public."organization" where id = $1 and btrim(name) = $2`,
    [organizationId, confirmationName]
  )
  if (result.rows.length === 0) {
    throw new Error("Enter the current organisation name to confirm removal.")
  }
}

async function assertNoPendingStationPurchase(organizationId: string) {
  const result = await getDatabase().query(
    `select 1
     from billing_private.clock_station_purchases purchase
     join public.locations location on location.id = purchase.location_id
     where location.organization_id = $1 and (
       (purchase.payment_status = 'awaiting_payment' and purchase.stripe_checkout_session_id is not null)
       or (purchase.payment_status = 'paid' and purchase.fulfillment_status not in ('shipped', 'delivered'))
     )
     limit 1`,
    [organizationId]
  )
  if (result.rows.length > 0) {
    throw new Error(
      "This organisation has an outstanding clock station order. Contact support for help removing it."
    )
  }
}

async function deleteConfirmedOrganization(
  organizationId: string,
  userId: string,
  confirmationName: string
) {
  const result = await getDatabase().query(
    `with removed as (
       delete from public."organization" organization
       using public.member membership
       where organization.id = $1
         and btrim(organization.name) = $3
         and membership."organizationId" = organization.id
         and membership."userId" = $2
         and membership.role = 'owner'
       returning organization.id
     ), cleared_sessions as (
       update public.session session
       set "activeOrganizationId" = null
       from removed
       where session."activeOrganizationId" = removed.id
     )
     select id from removed`,
    [organizationId, userId, confirmationName]
  )
  if (result.rows.length === 0) {
    throw new Error(
      "The organisation or your permissions changed. Refresh and try again."
    )
  }
}

export { cancelSubscriptionAsOwner, removeOrganizationAsOwner }
