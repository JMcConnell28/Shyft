import type { PoolClient } from "pg"

import type {
  AnnouncementLocationTarget,
  AnnouncementScopeInput,
} from "@/features/announcements/types"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { getOrganizationRole } from "@/lib/auth/has-org-permission"
import type { OrganizationRole } from "@/lib/auth/permissions"
import { getDatabase } from "@/lib/db"

type AnnouncementContext = {
  locationId: string | null
  organizationId: string
  role: OrganizationRole | null
  userId: string
}

type LocationRow = {
  id: string
  name: string
}

type WorkspaceLocationRow = LocationRow & {
  organization_id: string | null
}

async function getAnnouncementContext(
  input: AnnouncementScopeInput,
): Promise<AnnouncementContext> {
  const { session } = await requireVerifiedSessionOrThrow()

  if (session.user.id !== input.userId) {
    throw new Error(
      "Your workspace session is no longer valid. Refresh and try again.",
    )
  }

  if (input.organizationId) {
    if (session.session.activeOrganizationId !== input.organizationId) {
      throw new Error(
        "Your workspace session is no longer valid. Refresh and try again.",
      )
    }

    return {
      locationId: null,
      organizationId: input.organizationId,
      role: await getOrganizationRole(input.organizationId, session.user.id),
      userId: session.user.id,
    }
  }

  if (!input.locationId) {
    throw new Error("Choose a workspace.")
  }

  const location = await getWorkspaceLocation(input.locationId)

  if (!location.organization_id) {
    throw new Error("Announcements are available for organisation workspaces.")
  }

  if (session.session.activeOrganizationId !== location.organization_id) {
    throw new Error(
      "Your workspace session is no longer valid. Refresh and try again.",
    )
  }

  return {
    locationId: location.id,
    organizationId: location.organization_id,
    role: await getOrganizationRole(location.organization_id, session.user.id),
    userId: session.user.id,
  }
}

async function getWorkspaceLocation(locationId: string) {
  const result = await getDatabase().query<WorkspaceLocationRow>(
    `select id, name, organization_id
     from public.locations
     where id = $1::uuid
     limit 1`,
    [locationId],
  )
  const location = result.rows.at(0)

  if (!location) {
    throw new Error("That workspace could not be found.")
  }

  return location
}

async function listAnnouncementManageableLocations(
  context: AnnouncementContext,
): Promise<AnnouncementLocationTarget[]> {
  if (context.role === "owner" || context.role === "admin") {
    return listOrganizationLocations(context.organizationId)
  }

  if (context.role !== "manager") {
    return []
  }

  const result = await getDatabase().query<LocationRow>(
    `select location.id, location.name
     from public.locations location
     join public.location_memberships membership
       on membership.location_id = location.id
      and membership.user_id = $2
      and membership.role = any(array['owner', 'admin', 'manager']::text[])
     where location.organization_id = $1
     order by location.created_at asc, location.name asc`,
    [context.organizationId, context.userId],
  )

  return result.rows
}

async function listOrganizationLocations(organizationId: string) {
  const result = await getDatabase().query<LocationRow>(
    `select id, name
     from public.locations
     where organization_id = $1
     order by created_at asc, name asc`,
    [organizationId],
  )

  return result.rows
}

async function listAnnouncementVisibleLocationIds(context: AnnouncementContext) {
  if (context.role === "owner" || context.role === "admin") {
    const locations = await listOrganizationLocations(context.organizationId)
    return locations.map((location) => location.id)
  }

  const result = await getDatabase().query<{ id: string }>(
    `select distinct visible_location.id
     from (
       select location.id
       from public.locations location
       join public.location_memberships membership
         on membership.location_id = location.id
        and membership.user_id = $2
        and membership.role = any(array['owner', 'admin', 'manager']::text[])
       where location.organization_id = $1

       union

       select assignment.location_id as id
       from public.employees employee
       join public.employee_location_assignments assignment
         on assignment.employee_id = employee.id
        and assignment.is_enabled = true
        and assignment.disabled_at is null
       join public.locations location on location.id = assignment.location_id
       where employee.organization_id = $1
         and employee.user_id = $2
         and employee.status = 'active'
         and location.organization_id = $1
     ) visible_location`,
    [context.organizationId, context.userId],
  )

  return result.rows.map((location) => location.id)
}

async function withAnnouncementTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
) {
  const client = await getDatabase().connect()

  try {
    await client.query("begin")
    const result = await callback(client)
    await client.query("commit")
    return result
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}

export {
  getAnnouncementContext,
  listAnnouncementManageableLocations,
  listAnnouncementVisibleLocationIds,
  withAnnouncementTransaction,
}
export type { AnnouncementContext }
