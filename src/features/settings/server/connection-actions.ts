import "@tanstack/react-start/server-only"

import { randomUUID } from "node:crypto"
import type { PoolClient } from "pg"

import { syncBillingAccountAfterCoverageChange } from "@/features/billing/server/subscriptions"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { sendWorkspaceWelcomeNotification } from "@/features/onboarding/server/workspace-welcome"
import { getOrCreateOrganizationBillingAccount } from "@/features/settings/server/connection-shared"
import type { CreateOrganizationFromLocationResult } from "@/features/settings/types"
import { getLocationRole } from "@/lib/auth/has-location-permission"
import { getOrganizationRole } from "@/lib/auth/has-org-permission"
import { getDatabase } from "@/lib/db"
import { normalizeOrganizationSlug } from "@/lib/onboarding-schemas"
import { getOrganizationDashboardPath } from "@/lib/organization-paths"

const connectionManagerRoles = new Set(["owner", "admin"])

type BillingMode = "keep" | "organization"

type LocationTransferRow = {
  id: string
  organization_id: string | null
  billing_account_id: string
  billing_scope: "location" | "organization" | null
  billing_organization_id: string | null
}

type ConnectionActionResult = {
  success: true
  stripeSyncWarning: string | null
}

async function requireLocationConnectionPermission(input: {
  locationId: string
  organizationId: string | null
  userId: string
}) {
  const role = await getLocationRole(input.locationId, input.userId)

  if (role && connectionManagerRoles.has(role)) {
    return
  }

  if (input.organizationId) {
    const organizationRole = await getOrganizationRole(
      input.organizationId,
      input.userId,
    )

    if (organizationRole && connectionManagerRoles.has(organizationRole)) {
      return
    }
  }

  throw new Error("You must be a location owner or admin to move a location.")
}

async function requireOrganizationConnectionPermission(input: {
  organizationId: string
  userId: string
  message?: string
}) {
  const role = await getOrganizationRole(input.organizationId, input.userId)

  if (!role || !connectionManagerRoles.has(role)) {
    throw new Error(
      input.message ??
        "You must be an organization owner or admin to use that organization.",
    )
  }
}

async function getLocationTransferState(locationId: string) {
  const result = await getDatabase().query<LocationTransferRow>(
    `select location.id,
            location.organization_id,
            location.billing_account_id,
            billing_account.scope as billing_scope,
            billing_account.organization_id as billing_organization_id
     from public.locations location
     join public.billing_accounts billing_account
       on billing_account.id = location.billing_account_id
     where location.id = $1
     limit 1`,
    [locationId],
  )
  const location = result.rows.at(0)

  if (!location) {
    throw new Error("We could not find that location.")
  }

  return location
}

async function requireSourceOrganizationApproval(input: {
  sourceOrganizationId: string | null
  targetOrganizationId: string
  userId: string
}) {
  if (
    !input.sourceOrganizationId ||
    input.sourceOrganizationId === input.targetOrganizationId
  ) {
    return
  }

  await requireOrganizationConnectionPermission({
    organizationId: input.sourceOrganizationId,
    userId: input.userId,
    message:
      "You must be an owner or admin of the current organization before moving this location out.",
  })
}

async function syncChangedBillingAccounts(
  billingAccountIds: Array<string | null>,
) {
  const uniqueBillingAccountIds = Array.from(
    new Set(billingAccountIds.filter((id): id is string => Boolean(id))),
  )

  try {
    await Promise.all(
      uniqueBillingAccountIds.map((billingAccountId) =>
        syncBillingAccountAfterCoverageChange(billingAccountId),
      ),
    )

    return null
  } catch {
    return "The location was moved, but Stripe subscription quantities need reconciliation."
  }
}

async function getOrCreateOrganizationBillingAccountForClient(
  client: PoolClient,
  input: {
    organizationId: string
    ownerUserId: string
  },
) {
  const result = await client.query<{ id: string }>(
    `with existing_account as (
       select id
       from public.billing_accounts
       where scope = 'organization'
         and organization_id = $1
       limit 1
     ),
     created_account as (
       insert into public.billing_accounts (
         scope,
         organization_id,
         owner_user_id
       )
       select 'organization', $1, $2
       where not exists (select 1 from existing_account)
       returning id
     ),
     chosen_account as (
       select id from existing_account
       union all
       select id from created_account
       limit 1
     )
     select id from chosen_account`,
    [input.organizationId, input.ownerUserId],
  )
  const accountId = result.rows.at(0)?.id

  if (!accountId) {
    throw new Error("We could not prepare organization billing.")
  }

  return accountId
}

async function updateLocationConnectionForClient(
  client: PoolClient,
  input: {
  billingMode: BillingMode
  locationId: string
  targetBillingAccountId: string | null
  targetOrganizationId: string
  userId: string
},
) {
  const currentResult = await client.query<LocationTransferRow>(
    `select location.id,
              location.organization_id,
              location.billing_account_id,
              billing_account.scope as billing_scope,
              billing_account.organization_id as billing_organization_id
       from public.locations location
       join public.billing_accounts billing_account
         on billing_account.id = location.billing_account_id
       where location.id = $1
       for update of location`,
    [input.locationId],
  )
  const current = currentResult.rows.at(0)

  if (!current) {
    throw new Error("We could not find that location.")
  }

  if (
    input.billingMode === "keep" &&
    current.billing_scope === "organization" &&
    current.billing_organization_id !== input.targetOrganizationId
  ) {
    throw new Error(
      "This location currently uses organization billing. Move it onto the destination organization's billing instead.",
    )
  }

  const nextBillingAccountId =
    input.billingMode === "organization"
      ? input.targetBillingAccountId
      : current.billing_account_id

  if (!nextBillingAccountId) {
    throw new Error("Choose where billing should move.")
  }

  await client.query(
    `update public.locations
       set organization_id = $2,
           billing_account_id = $3,
           updated_at = timezone('utc', now())
       where id = $1`,
    [input.locationId, input.targetOrganizationId, nextBillingAccountId],
  )

  if (
    input.billingMode === "keep" &&
    current.billing_scope === "location"
  ) {
    await client.query(
      `update public.billing_accounts
         set organization_id = $2,
             updated_at = timezone('utc', now())
         where id = $1
           and scope = 'location'`,
      [current.billing_account_id, input.targetOrganizationId],
    )
  }

  if (current.organization_id !== input.targetOrganizationId) {
    await client.query(
      `insert into public.workspace_connection_events (
           event_type,
           location_id,
           source_organization_id,
           target_organization_id,
           source_billing_account_id,
           target_billing_account_id,
           actor_user_id,
           metadata
         ) values (
           'location_organization_move',
           $1,
           $2,
           $3,
           $4,
           $5,
           $6,
           jsonb_build_object('billingMode', $7)
         )`,
      [
        input.locationId,
        current.organization_id,
        input.targetOrganizationId,
        current.billing_account_id,
        nextBillingAccountId,
        input.userId,
        input.billingMode,
      ],
    )
  }

  if (current.billing_account_id !== nextBillingAccountId) {
    await client.query(
      `insert into public.workspace_connection_events (
           event_type,
           location_id,
           source_organization_id,
           target_organization_id,
           source_billing_account_id,
           target_billing_account_id,
           actor_user_id,
           metadata
         ) values (
           'location_billing_move',
           $1,
           $2,
           $3,
           $4,
           $5,
           $6,
           jsonb_build_object('billingMode', $7)
         )`,
      [
        input.locationId,
        current.organization_id,
        input.targetOrganizationId,
        current.billing_account_id,
        nextBillingAccountId,
        input.userId,
        input.billingMode,
      ],
    )
  }

  return {
    nextBillingAccountId,
    previousBillingAccountId: current.billing_account_id,
  }
}

async function updateLocationConnection(input: {
  billingMode: BillingMode
  locationId: string
  targetBillingAccountId: string | null
  targetOrganizationId: string
  userId: string
}) {
  const database = getDatabase()
  const client = await database.connect()

  try {
    await client.query("BEGIN")

    const result = await updateLocationConnectionForClient(client, input)

    await client.query("COMMIT")

    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

async function moveLocationToOrganization(input: {
  billingMode: BillingMode
  locationId: string
  targetOrganizationId: string
}): Promise<ConnectionActionResult> {
  const { session } = await requireVerifiedSessionOrThrow()
  const current = await getLocationTransferState(input.locationId)

  await requireLocationConnectionPermission({
    locationId: input.locationId,
    organizationId: current.organization_id,
    userId: session.user.id,
  })
  await requireSourceOrganizationApproval({
    sourceOrganizationId: current.organization_id,
    targetOrganizationId: input.targetOrganizationId,
    userId: session.user.id,
  })
  await requireOrganizationConnectionPermission({
    organizationId: input.targetOrganizationId,
    userId: session.user.id,
  })

  const targetBillingAccount =
    input.billingMode === "organization"
      ? await getOrCreateOrganizationBillingAccount({
          organizationId: input.targetOrganizationId,
          ownerUserId: session.user.id,
        })
      : null
  const result = await updateLocationConnection({
    billingMode: input.billingMode,
    locationId: input.locationId,
    targetBillingAccountId: targetBillingAccount?.id ?? null,
    targetOrganizationId: input.targetOrganizationId,
    userId: session.user.id,
  })
  const stripeSyncWarning =
    input.billingMode === "organization"
      ? await syncChangedBillingAccounts([
          result.previousBillingAccountId,
          result.nextBillingAccountId,
        ])
      : null

  return {
    success: true,
    stripeSyncWarning,
  }
}

async function moveLocationToOrganizationBilling(input: {
  locationId: string
  organizationId: string
}): Promise<ConnectionActionResult> {
  const { session } = await requireVerifiedSessionOrThrow()
  const current = await getLocationTransferState(input.locationId)

  if (current.organization_id !== input.organizationId) {
    throw new Error(
      "Move this location into the organization before centralizing billing.",
    )
  }

  await requireLocationConnectionPermission({
    locationId: input.locationId,
    organizationId: current.organization_id,
    userId: session.user.id,
  })
  await requireOrganizationConnectionPermission({
    organizationId: input.organizationId,
    userId: session.user.id,
  })

  const targetBillingAccount = await getOrCreateOrganizationBillingAccount({
    organizationId: input.organizationId,
    ownerUserId: session.user.id,
  })

  if (current.billing_account_id === targetBillingAccount.id) {
    return {
      success: true,
      stripeSyncWarning: null,
    }
  }

  const result = await updateLocationConnection({
    billingMode: "organization",
    locationId: input.locationId,
    targetBillingAccountId: targetBillingAccount.id,
    targetOrganizationId: input.organizationId,
    userId: session.user.id,
  })
  const stripeSyncWarning = await syncChangedBillingAccounts([
    result.previousBillingAccountId,
    result.nextBillingAccountId,
  ])

  return {
    success: true,
    stripeSyncWarning,
  }
}

async function createOrganizationFromLocation(input: {
  billingMode: BillingMode
  locationId: string
  name: string
  slug: string
}): Promise<CreateOrganizationFromLocationResult> {
  const { session } = await requireVerifiedSessionOrThrow()
  const database = getDatabase()
  const client = await database.connect()
  const organizationId = randomUUID()
  const organizationName = input.name.trim()
  const organizationSlug = normalizeOrganizationSlug(input.slug)
  let previousBillingAccountId: string | null = null
  let nextBillingAccountId: string | null = null

  try {
    await client.query("BEGIN")

    const currentResult = await client.query<LocationTransferRow>(
      `select location.id,
              location.organization_id,
              location.billing_account_id,
              billing_account.scope as billing_scope,
              billing_account.organization_id as billing_organization_id
       from public.locations location
       join public.billing_accounts billing_account
         on billing_account.id = location.billing_account_id
       where location.id = $1
       for update of location`,
      [input.locationId],
    )
    const current = currentResult.rows.at(0)

    if (!current) {
      throw new Error("We could not find that location.")
    }

    if (current.organization_id) {
      throw new Error("This location is already connected to an organization.")
    }

    await requireLocationConnectionPermission({
      locationId: input.locationId,
      organizationId: current.organization_id,
      userId: session.user.id,
    })

    const organizationResult = await client.query<{ id: string }>(
      `insert into public."organization" (
         "id",
         "name",
         "slug",
         "createdAt",
         "metadata"
       ) values ($1, $2, $3, timezone('utc', now()), $4)
       on conflict ("slug") do nothing
       returning "id"`,
      [
        organizationId,
        organizationName,
        organizationSlug,
        JSON.stringify({
          createdFromLocationId: input.locationId,
          createdFrom: "settings_connections",
        }),
      ],
    )

    if (!organizationResult.rows.at(0)) {
      throw new Error("That organization URL is already in use.")
    }

    await client.query(
      `insert into public."member" (
         "id",
         "organizationId",
         "userId",
         "role",
         "createdAt"
       ) values ($1, $2, $3, 'owner', timezone('utc', now()))`,
      [randomUUID(), organizationId, session.user.id],
    )

    const targetBillingAccountId =
      input.billingMode === "organization"
        ? await getOrCreateOrganizationBillingAccountForClient(client, {
            organizationId,
            ownerUserId: session.user.id,
          })
        : null

    const billingChange = await updateLocationConnectionForClient(client, {
      billingMode: input.billingMode,
      locationId: input.locationId,
      targetBillingAccountId,
      targetOrganizationId: organizationId,
      userId: session.user.id,
    })

    previousBillingAccountId = billingChange.previousBillingAccountId
    nextBillingAccountId = billingChange.nextBillingAccountId

    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }

  const stripeSyncWarning =
    input.billingMode === "organization"
      ? await syncChangedBillingAccounts([
          previousBillingAccountId,
          nextBillingAccountId,
        ])
      : null

  await sendWorkspaceWelcomeNotification({
    to: session.user.email,
    dashboardPath: getOrganizationDashboardPath(organizationSlug),
    userName: session.user.name,
    workspaceName: organizationName,
    workspaceType: "organization",
  })

  return {
    success: true,
    organizationId,
    organizationSlug,
    stripeSyncWarning,
  }
}

export {
  createOrganizationFromLocation,
  moveLocationToOrganization,
  moveLocationToOrganizationBilling,
}
