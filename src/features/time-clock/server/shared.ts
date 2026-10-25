import "@tanstack/react-start/server-only"

import { createHash } from "node:crypto"

import { listManagedClockLocations } from "./managed-clock-locations"
// eslint-disable-next-line no-duplicate-imports
import type { ManagedLocation } from "./managed-clock-locations"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { requireLocationPermission } from "@/lib/auth/has-location-permission"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import { getAuthRequestHeaders } from "@/lib/auth-session.server"

type ClockScope = {
  organizationId: string | null
  locationId: string | null
  userId: string
}

async function requireClockManagerScope(input: {
  organizationId?: string
  locationId?: string
  userId: string
}): Promise<ClockScope> {
  const { session } = await requireVerifiedSessionOrThrow()
  assertCurrentUser(session.user.id, input.userId)

  if (input.organizationId) {
    assertActiveOrganization(
      session.session.activeOrganizationId,
      input.organizationId
    )
    await requireOrgPermission({
      organizationId: input.organizationId,
      userId: session.user.id,
      permissions: {
        shift: ["update"],
      },
      errorMessage: "You do not have permission to manage the time clock.",
    })

    return {
      organizationId: input.organizationId,
      locationId: null,
      userId: session.user.id,
    }
  }

  if (!input.locationId) {
    throw new Error("Choose a location.")
  }

  await requireLocationPermission({
    locationId: input.locationId,
    userId: session.user.id,
    permissions: {
      shift: ["update"],
    },
    errorMessage: "You do not have permission to manage the time clock.",
  })
  return {
    organizationId: null,
    locationId: input.locationId,
    userId: session.user.id,
  }
}

async function requireClockSettingsScope(input: {
  organizationId?: string
  locationId?: string
  userId: string
}): Promise<ClockScope> {
  const { session } = await requireVerifiedSessionOrThrow()
  assertCurrentUser(session.user.id, input.userId)

  if (input.organizationId) {
    assertActiveOrganization(
      session.session.activeOrganizationId,
      input.organizationId
    )
    await requireOrgPermission({
      organizationId: input.organizationId,
      userId: session.user.id,
      permissions: {
        location: ["update"],
      },
      errorMessage: "You do not have permission to update clock settings.",
    })

    return {
      organizationId: input.organizationId,
      locationId: null,
      userId: session.user.id,
    }
  }

  if (!input.locationId) {
    throw new Error("Choose a location.")
  }

  await requireLocationPermission({
    locationId: input.locationId,
    userId: session.user.id,
    permissions: {
      location: ["update"],
    },
    errorMessage: "You do not have permission to update clock settings.",
  })
  return {
    organizationId: null,
    locationId: input.locationId,
    userId: session.user.id,
  }
}

async function ensureLocationInScope(
  scope: ClockScope,
  locationId: string
): Promise<ManagedLocation> {
  const locations = await listManagedClockLocations(scope)
  const location = locations.find((item) => item.id === locationId) ?? null

  if (!location) {
    throw new Error("Choose a location you can manage.")
  }

  return location
}

function hashAuditValue(value: string | null) {
  if (!value) {
    return null
  }

  return createHash("sha256").update(value).digest("hex")
}

function getRequestAuditFields() {
  const headers = getAuthRequestHeaders()
  const forwardedFor = headers.get("x-forwarded-for")?.split(",").at(0)?.trim()
  const ipAddress =
    forwardedFor ??
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    null

  return {
    ipHash: hashAuditValue(ipAddress),
    userAgent: headers.get("user-agent"),
  }
}

function assertCurrentUser(sessionUserId: string, inputUserId: string) {
  if (sessionUserId !== inputUserId) {
    throw new Error(
      "Your workspace session is no longer valid. Refresh and try again."
    )
  }
}

function assertActiveOrganization(
  activeOrganizationId: string | null | undefined,
  organizationId: string
) {
  if (activeOrganizationId !== organizationId) {
    throw new Error(
      "Your workspace session is no longer valid. Refresh and try again."
    )
  }
}

export {
  assertCurrentUser,
  ensureLocationInScope,
  getRequestAuditFields,
  listManagedClockLocations,
  requireClockManagerScope,
  requireClockSettingsScope,
}
export type { ClockScope, ManagedLocation }
