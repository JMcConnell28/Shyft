import { createServerFn } from "@tanstack/react-start"
import type { PoolClient } from "pg"

import {
  activateOrganizationSchema,
  locationSetupSchema,
  normalizeOrganizationSlug,
  organizationSetupSchema,
  verifyEmailSchema,
} from "@/lib/onboarding-schemas"
import { auth } from "@/lib/auth"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import { getDatabase } from "@/lib/db"
import {
  getLocationDashboardPath,
  getOrganizationDashboardPath,
} from "@/lib/organization-paths"

import { FREE_TRIAL_DAYS } from "@/features/onboarding/constants"
import {
  requireSessionOrThrow,
  requireVerifiedSessionOrThrow,
  setActiveOrganizationForHeaders,
} from "@/features/onboarding/server/session"
import {
  createUniqueLocationSlug,
  ensureDefaultStaffGroup,
  upsertOnboardingState,
} from "@/features/onboarding/server/state"
import { sendWorkspaceWelcomeNotification } from "@/features/onboarding/server/workspace-welcome"

const resendVerificationEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => verifyEmailSchema.parse(input))
  .handler(async ({ data }) => {
    await auth.api.sendVerificationEmail({
      body: {
        email: data.email,
        callbackURL: data.callbackURL,
      },
    })

    return { success: true }
  })

const checkOrganizationSlugAvailability = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    organizationSetupSchema.pick({ slug: true }).parse(input),
  )
  .handler(async ({ data }) => {
    const { headers } = await requireSessionOrThrow()
    const result = await auth.api.checkOrganizationSlug({
      headers,
      body: {
        slug: normalizeOrganizationSlug(data.slug),
      },
    })

    return {
      available: Boolean(result.status),
    }
  })

const activateOrganization = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => activateOrganizationSchema.parse(input))
  .handler(async ({ data }) => {
    const { headers } = await requireSessionOrThrow()

    await setActiveOrganizationForHeaders(headers, data.organizationId)

    return { success: true }
  })

const createOrganizationWithBootstrap = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => organizationSetupSchema.parse(input))
  .handler(async ({ data }) => {
    const { headers } = await requireVerifiedSessionOrThrow()
    const organizationName = data.name.trim()
    const slug = normalizeOrganizationSlug(data.slug)

    const availability = await auth.api.checkOrganizationSlug({
      headers,
      body: { slug },
    })

    if (!availability.status) {
      throw new Error("That organization URL is already in use.")
    }

    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + FREE_TRIAL_DAYS)

    const organization = await auth.api.createOrganization({
      headers,
      body: {
        name: organizationName,
        slug,
        metadata: {
          trialStartedAt: new Date().toISOString(),
          trialEndsAt: trialEndsAt.toISOString(),
        },
      },
    })

    if (!organization) {
      throw new Error("We could not create your organization.")
    }

    await Promise.all([
      upsertOnboardingState(organization.id, {
        trialEndsAt,
        lastStep: "location",
      }),
      ensureDefaultStaffGroup(organization.id),
      setActiveOrganizationForHeaders(headers, organization.id),
    ])

    return {
      organizationId: organization.id,
      redirectTo: "/onboarding/location" as const,
    }
  })

const createFirstLocationAndZone = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => locationSetupSchema.parse(input))
  .handler(async ({ data }) => {
    const { session } = await requireVerifiedSessionOrThrow()
    const organizationId = session.session.activeOrganizationId

    const locationName = data.locationName.trim()
    const zoneNames = getUniqueNames(data.zoneNames)
    const worksiteName = data.worksiteName.trim()

    if (!organizationId) {
      const locationSlug = await createUniqueLocationSlug(null, locationName)
      const database = getDatabase()
      const client = await database.connect()

      try {
        await client.query("BEGIN")

        const locationResult = await client.query<{ id: string }>(
          `insert into public.locations (
             organization_id,
             name,
             slug,
             business_type,
             planning_mode
           ) values (null, $1, $2, $3, $4)
           returning id`,
          [locationName, locationSlug, data.businessType, data.planningMode],
        )
        const locationId = locationResult.rows[0]?.id

        if (!locationId) {
          throw new Error("We could not save your first location.")
        }

        await client.query(
          `insert into public.location_memberships (
             location_id,
             user_id,
             role
           ) values ($1, $2, 'owner')
           on conflict (location_id, user_id)
           do update set role = excluded.role,
                         updated_at = timezone('utc', now())`,
          [locationId, session.user.id],
        )

        const staffGroupResult = await client.query<{ id: string }>(
          `insert into public.staff_groups (
             location_id,
             name,
             slug,
             is_default,
             color
           ) values ($1, 'Employee', 'employee', true, 'emerald')
           on conflict (location_id, slug)
           where location_id is not null
           do update set is_default = true,
                         updated_at = timezone('utc', now())
           returning id`,
          [locationId],
        )
        const staffGroupId = staffGroupResult.rows[0]?.id

        if (!staffGroupId) {
          throw new Error("We could not save your first staff group.")
        }

        const employeeResult = await client.query<{ id: string }>(
          `insert into public.employees (
             organization_id,
             location_id,
             user_id,
             staff_group_id,
             full_name,
             email,
             status
           ) values (null, $1, $2, $3, $4, $5, 'active')
           on conflict (location_id, user_id)
           where location_id is not null and user_id is not null
           do update set staff_group_id = excluded.staff_group_id,
                         full_name = excluded.full_name,
                         email = excluded.email,
                         status = 'active',
                         updated_at = timezone('utc', now())
           returning id`,
          [
            locationId,
            session.user.id,
            staffGroupId,
            session.user.name,
            session.user.email,
          ],
        )
        const employeeId = employeeResult.rows[0]?.id

        if (!employeeId) {
          throw new Error("We could not add you to the employee list.")
        }

        await client.query(
          `insert into public.employee_location_assignments (
             organization_id,
             employee_id,
             location_id,
             is_enabled
           ) values (null, $1, $2, true)
           on conflict (employee_id, location_id)
           do update set is_enabled = true,
                         disabled_at = null`,
          [employeeId, locationId],
        )

        await createInitialPlaces({
          client,
          organizationId: null,
          locationId,
          planningMode: data.planningMode,
          zoneNames,
          worksiteName,
        })

        await client.query("COMMIT")

        await sendWorkspaceWelcomeNotification({
          to: session.user.email,
          dashboardPath: getLocationDashboardPath(locationSlug),
          userName: session.user.name,
          workspaceName: locationName,
          workspaceType: "location",
        })

        return {
          locationId,
          redirectTo: getLocationDashboardPath(locationSlug),
        }
      } catch (error) {
        await client.query("ROLLBACK")
        throw error
      } finally {
        client.release()
      }
    }

    await requireOrgPermission({
      organizationId,
      userId: session.user.id,
      permissions: {
        location: ["create"],
      },
      errorMessage: "You do not have permission to create locations.",
    })

    const locationSlug = await createUniqueLocationSlug(organizationId, locationName)
    const database = getDatabase()
    const client = await database.connect()

    try {
      await client.query("BEGIN")

      const locationResult = await client.query<{ id: string }>(
        `insert into public.locations (
           organization_id,
           name,
           slug,
           business_type,
           planning_mode
         ) values ($1, $2, $3, $4, $5)
         returning id`,
        [
          organizationId,
          locationName,
          locationSlug,
          data.businessType,
          data.planningMode,
        ],
      )
      const locationId = locationResult.rows.at(0)?.id

      if (!locationId) {
        throw new Error("We could not save your first location.")
      }

      await createInitialPlaces({
        client,
        organizationId,
        locationId,
        planningMode: data.planningMode,
        zoneNames,
        worksiteName,
      })

      await client.query("COMMIT")

      await upsertOnboardingState(organizationId, {
        lastStep: "complete",
        completedAt: new Date(),
      })

      const organization = await getRequiredOrganizationWorkspace(organizationId)

      await sendWorkspaceWelcomeNotification({
        to: session.user.email,
        dashboardPath: getOrganizationDashboardPath(organization.slug),
        userName: session.user.name,
        workspaceName: organization.name,
        workspaceType: "organization",
      })

      return {
        locationId,
        redirectTo: getOrganizationDashboardPath(organization.slug),
      }
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  })

function getUniqueNames(names: string[]) {
  return Array.from(
    new Map(
      names
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => [name.toLowerCase(), name]),
    ).values(),
  )
}

async function createInitialPlaces({
  client,
  organizationId,
  locationId,
  planningMode,
  zoneNames,
  worksiteName,
}: {
  client: PoolClient
  organizationId: string | null
  locationId: string
  planningMode: "fixed_location" | "variable_location"
  zoneNames: string[]
  worksiteName: string
}) {
  if (planningMode === "fixed_location") {
    if (zoneNames.length === 0) {
      throw new Error("Choose at least one area for your first rota.")
    }

    for (const [sortOrder, zoneName] of zoneNames.entries()) {
      await client.query(
        `insert into public.zones (
           organization_id,
           location_id,
           name,
           sort_order
         ) values ($1, $2, $3, $4)
         on conflict (location_id, name) do nothing`,
        [organizationId, locationId, zoneName, sortOrder],
      )
    }

    return
  }

  if (!worksiteName) {
    return
  }

  await client.query(
    `insert into public.worksites (
       organization_id,
       location_id,
       name,
       sort_order
     ) values ($1, $2, $3, 0)
     on conflict do nothing`,
    [organizationId, locationId, worksiteName],
  )
}

async function getRequiredOrganizationWorkspace(organizationId: string) {
  const result = await getDatabase().query<{ name: string; slug: string }>(
    `select "name", "slug"
     from public."organization"
     where "id" = $1
     limit 1`,
    [organizationId],
  )
  const organization = result.rows.at(0)

  if (!organization) {
    throw new Error("We could not find your organization workspace.")
  }

  return organization
}

export {
  activateOrganization,
  checkOrganizationSlugAvailability,
  createFirstLocationAndZone,
  createOrganizationWithBootstrap,
  resendVerificationEmail,
}

