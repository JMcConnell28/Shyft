import { createServerFn } from "@tanstack/react-start"
import type { PoolClient } from "pg"

import {
  activateOrganizationSchema,
  locationSetupSchema,
  normalizeOrganizationSlug,
  organizationSetupSchema,
  verifyEmailSchema,
} from "@/lib/onboarding-schemas"
import {
  normalizePostcode,
  type TimeAttendanceDeliveryAddress,
} from "@/features/billing/schemas/time-attendance-addon-schemas"
import { auth } from "@/lib/auth"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import { getDatabase } from "@/lib/db"
import { getOrganizationDashboardPath } from "@/lib/organization-paths"

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
import { getMinimumWagePenceForDateOfBirth } from "@/features/staff-groups/utils/minimum-wage"

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
    organizationSetupSchema.pick({ slug: true }).parse(input)
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
      throw new Error("Create an organisation before adding a location.")
    }

    await requireOrgPermission({
      organizationId,
      userId: session.user.id,
      permissions: {
        location: ["create"],
      },
      errorMessage: "You do not have permission to create locations.",
    })

    const locationSlug = await createUniqueLocationSlug(
      organizationId,
      locationName
    )
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
        ]
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

      if (data.includeOwnerAsEmployee) {
        await createOwnerEmployeeForLocation({
          client,
          organizationId,
          locationId,
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
        })
      }

      if (data.timeAttendanceEnabled && data.timeAttendanceDeliveryAddress) {
        await requestOnboardingTimeAttendanceAddon({
          client,
          deliveryAddress: data.timeAttendanceDeliveryAddress,
          locationId,
        })
      }

      await client.query("COMMIT")

      await upsertOnboardingState(organizationId, {
        lastStep: "complete",
        completedAt: new Date(),
      })

      const organization =
        await getRequiredOrganizationWorkspace(organizationId)

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
        .map((name) => [name.toLowerCase(), name])
    ).values()
  )
}

async function getUserDateOfBirth(client: PoolClient, userId: string) {
  const result = await client.query<{ dateOfBirth: string | null }>(
    `select "dateOfBirth"
     from public."user"
     where id = $1
     limit 1`,
    [userId]
  )

  return result.rows.at(0)?.dateOfBirth ?? null
}

async function createOwnerEmployeeForLocation({
  client,
  organizationId,
  locationId,
  userId,
  userName,
  userEmail,
}: {
  client: PoolClient
  organizationId: string
  locationId: string
  userId: string
  userName: string
  userEmail: string
}) {
  const staffGroupResult = await client.query<{ id: string }>(
    `select id
     from public.staff_groups
     where organization_id = $1
       and (slug = 'employee' or slug = 'employees' or is_default = true)
     order by is_default desc, created_at asc
     limit 1`,
    [organizationId]
  )
  const staffGroupId = staffGroupResult.rows.at(0)?.id

  if (!staffGroupId) {
    throw new Error("We could not find the default employee group.")
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
     ) values ($1, null, $2, $3, $4, $5, 'active')
     on conflict (organization_id, user_id)
     where user_id is not null
     do update set staff_group_id = coalesce(employees.staff_group_id, excluded.staff_group_id),
                   location_id = null,
                   full_name = excluded.full_name,
                   email = excluded.email,
                   status = 'active',
                   updated_at = timezone('utc', now())
     returning id`,
    [organizationId, userId, staffGroupId, userName, userEmail]
  )
  const employeeId = employeeResult.rows.at(0)?.id

  if (!employeeId) {
    throw new Error("We could not add you to the employee list.")
  }

  const dateOfBirth = await getUserDateOfBirth(client, userId)
  const hourlyRatePence = getMinimumWagePenceForDateOfBirth(dateOfBirth)

  await client.query(
    `insert into public.employee_compensation (
       employee_id,
       organization_id,
       location_id,
       pay_type,
       hourly_rate_pence
     ) values ($1, $2, null, 'hourly', $3)
     on conflict (employee_id) do nothing`,
    [employeeId, organizationId, hourlyRatePence]
  )

  await client.query(
    `insert into public.employee_location_assignments (
       organization_id,
       employee_id,
       location_id,
       is_enabled
     ) values ($1, $2, $3, true)
     on conflict (employee_id, location_id)
     do update set is_enabled = true,
                   disabled_at = null`,
    [organizationId, employeeId, locationId]
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
         on conflict (location_id, (lower(name))) where deleted_at is null do nothing`,
        [organizationId, locationId, zoneName, sortOrder]
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
    [organizationId, locationId, worksiteName]
  )
}

async function requestOnboardingTimeAttendanceAddon({
  client,
  deliveryAddress,
  locationId,
}: {
  client: PoolClient
  deliveryAddress: TimeAttendanceDeliveryAddress
  locationId: string
}) {
  const entitlementResult = await client.query<{ trial_ends_at: Date }>(
    `select trial_ends_at
     from billing_private.location_entitlements
     where location_id = $1
     limit 1`,
    [locationId]
  )
  const trialEndsAt = entitlementResult.rows.at(0)?.trial_ends_at

  if (!trialEndsAt) {
    throw new Error("We could not prepare Time & Attendance billing.")
  }

  await client.query(
    `insert into billing_private.location_addons (
       location_id,
       addon_type,
       status,
       activated_at,
       billing_starts_at
     ) values ($1, 'time_attendance', 'trialing', timezone('utc', now()), $2)
     on conflict (location_id, addon_type)
     do update set status = 'trialing',
                   activated_at = coalesce(location_addons.activated_at, excluded.activated_at),
                   billing_starts_at = excluded.billing_starts_at,
                   cancel_at = null,
                   canceled_at = null,
                   legacy_opt_in_deadline = null,
                   updated_at = timezone('utc', now())`,
    [locationId, trialEndsAt]
  )

  await client.query(
    `insert into billing_private.location_hardware_entitlements (
       location_id,
       entitlement_status,
       fulfillment_status,
       claimed_at,
       delivery_country,
       delivery_name,
       delivery_line1,
       delivery_line2,
       delivery_city,
       delivery_county,
       delivery_postcode
     ) values ($1, 'claimed', 'pending', timezone('utc', now()), $2, $3, $4, $5, $6, $7, $8)
     on conflict (location_id)
     do update set entitlement_status = 'claimed',
                   fulfillment_status = 'pending',
                   claimed_at = coalesce(location_hardware_entitlements.claimed_at, timezone('utc', now())),
                   delivery_country = excluded.delivery_country,
                   delivery_name = excluded.delivery_name,
                   delivery_line1 = excluded.delivery_line1,
                   delivery_line2 = excluded.delivery_line2,
                   delivery_city = excluded.delivery_city,
                   delivery_county = excluded.delivery_county,
                   delivery_postcode = excluded.delivery_postcode,
                   updated_at = timezone('utc', now())`,
    [
      locationId,
      deliveryAddress.country,
      deliveryAddress.name,
      deliveryAddress.line1,
      deliveryAddress.line2 ?? null,
      deliveryAddress.city,
      deliveryAddress.county ?? null,
      normalizePostcode(deliveryAddress.postcode),
    ]
  )
}

async function getRequiredOrganizationWorkspace(organizationId: string) {
  const result = await getDatabase().query<{ name: string; slug: string }>(
    `select "name", "slug"
     from public."organization"
     where "id" = $1
     limit 1`,
    [organizationId]
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
