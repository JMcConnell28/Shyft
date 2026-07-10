import "@tanstack/react-start/server-only"

import type {
  WorkspaceConnectionLocation,
  WorkspaceConnectionOrganization,
  WorkspaceConnectionsPageData,
} from "@/features/settings/types"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { getDatabase } from "@/lib/db"

type OrganizationRow = {
  id: string
  name: string
  slug: string
  billing_account_id: string | null
  billing_status: string | null
}

type LocationRow = {
  id: string
  name: string
  slug: string
  organization_id: string | null
  organization_name: string | null
  billing_account_id: string | null
  billing_scope: "location" | "organization" | null
  billing_organization_id: string | null
  billing_status: string | null
}

function mapOrganization(
  organization: OrganizationRow,
): WorkspaceConnectionOrganization {
  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    billingAccountId: organization.billing_account_id,
    billingStatus: organization.billing_status,
  }
}

function mapLocation(location: LocationRow): WorkspaceConnectionLocation {
  return {
    id: location.id,
    name: location.name,
    slug: location.slug,
    organizationId: location.organization_id,
    organizationName: location.organization_name,
    billingAccountId: location.billing_account_id,
    billingScope: location.billing_scope,
    billingOrganizationId: location.billing_organization_id,
    billingStatus: location.billing_status,
    canKeepBillingWhenMoved: location.billing_scope !== "organization",
  }
}

async function listManageableOrganizations(userId: string) {
  const result = await getDatabase().query<OrganizationRow>(
    `select organization.id,
            organization.name,
            organization.slug,
            billing_account.id as billing_account_id,
            subscription.status as billing_status
     from public.member member
     join public.organization organization
       on organization.id = member."organizationId"
     left join public.billing_accounts billing_account
       on billing_account.scope = 'organization'
      and billing_account.organization_id = organization.id
     left join lateral (
       select status
       from public.billing_subscriptions
       where billing_account_id = billing_account.id
       order by created_at desc
       limit 1
     ) subscription on true
     where member."userId" = $1
       and member.role = any(array['owner', 'admin']::text[])
     order by organization.name asc`,
    [userId],
  )

  return result.rows.map(mapOrganization)
}

async function listManageableLocations(userId: string) {
  const result = await getDatabase().query<LocationRow>(
    `with manageable_location_ids as (
       select membership.location_id as id
       from public.location_memberships membership
       where membership.user_id = $1
         and membership.role = any(array['owner', 'admin']::text[])

       union

       select location.id
       from public.locations location
       join public.member member
         on member."organizationId" = location.organization_id
       where member."userId" = $1
         and member.role = any(array['owner', 'admin']::text[])
     )
     select location.id,
            location.name,
            location.slug,
            location.organization_id,
            organization.name as organization_name,
            location.billing_account_id,
            billing_account.scope as billing_scope,
            billing_account.organization_id as billing_organization_id,
            subscription.status as billing_status
     from manageable_location_ids manageable_location
     join public.locations location on location.id = manageable_location.id
     left join public.organization organization
       on organization.id = location.organization_id
     left join public.billing_accounts billing_account
       on billing_account.id = location.billing_account_id
     left join lateral (
       select status
       from public.billing_subscriptions
       where billing_account_id = billing_account.id
       order by created_at desc
       limit 1
     ) subscription on true
     order by location.name asc`,
    [userId],
  )

  return result.rows.map(mapLocation)
}

async function getCurrentOrganization(organizationId: string) {
  const result = await getDatabase().query<OrganizationRow>(
    `select organization.id,
            organization.name,
            organization.slug,
            billing_account.id as billing_account_id,
            subscription.status as billing_status
     from public.organization organization
     left join public.billing_accounts billing_account
       on billing_account.scope = 'organization'
      and billing_account.organization_id = organization.id
     left join lateral (
       select status
       from public.billing_subscriptions
       where billing_account_id = billing_account.id
       order by created_at desc
       limit 1
     ) subscription on true
     where organization.id = $1
     limit 1`,
    [organizationId],
  )

  const organization = result.rows.at(0)

  return organization ? mapOrganization(organization) : null
}

async function getCurrentLocation(locationId: string) {
  const result = await getDatabase().query<LocationRow>(
    `select location.id,
            location.name,
            location.slug,
            location.organization_id,
            organization.name as organization_name,
            location.billing_account_id,
            billing_account.scope as billing_scope,
            billing_account.organization_id as billing_organization_id,
            subscription.status as billing_status
     from public.locations location
     left join public.organization organization
       on organization.id = location.organization_id
     left join public.billing_accounts billing_account
       on billing_account.id = location.billing_account_id
     left join lateral (
       select status
       from public.billing_subscriptions
       where billing_account_id = billing_account.id
       order by created_at desc
       limit 1
     ) subscription on true
     where location.id = $1
     limit 1`,
    [locationId],
  )

  const location = result.rows.at(0)

  return location ? mapLocation(location) : null
}

async function listOrganizationLocations(organizationId: string) {
  const result = await getDatabase().query<LocationRow>(
    `select location.id,
            location.name,
            location.slug,
            location.organization_id,
            organization.name as organization_name,
            location.billing_account_id,
            billing_account.scope as billing_scope,
            billing_account.organization_id as billing_organization_id,
            subscription.status as billing_status
     from public.locations location
     left join public.organization organization
       on organization.id = location.organization_id
     left join public.billing_accounts billing_account
       on billing_account.id = location.billing_account_id
     left join lateral (
       select status
       from public.billing_subscriptions
       where billing_account_id = billing_account.id
       order by created_at desc
       limit 1
     ) subscription on true
     where location.organization_id = $1
     order by location.name asc`,
    [organizationId],
  )

  return result.rows.map(mapLocation)
}

async function getWorkspaceConnectionsPageData(input: {
  organizationId?: string
  locationId?: string
}): Promise<WorkspaceConnectionsPageData> {
  const { session } = await requireVerifiedSessionOrThrow()
  const [
    manageableOrganizations,
    manageableLocations,
    currentOrganization,
    currentLocation,
    organizationLocations,
  ] = await Promise.all([
    listManageableOrganizations(session.user.id),
    listManageableLocations(session.user.id),
    input.organizationId
      ? getCurrentOrganization(input.organizationId)
      : Promise.resolve(null),
    input.locationId ? getCurrentLocation(input.locationId) : Promise.resolve(null),
    input.organizationId
      ? listOrganizationLocations(input.organizationId)
      : Promise.resolve([]),
  ])

  return {
    currentOrganization,
    currentLocation,
    manageableOrganizations,
    manageableLocations,
    organizationLocations,
  }
}

export { getWorkspaceConnectionsPageData }
