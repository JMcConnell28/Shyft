import type { OrganizationRole } from "@/lib/auth/permissions"

const DEV_ROLE_OVERRIDE_COOKIE_PREFIX = "shyft_dev_role_override"
const DEV_ROLE_OVERRIDE_MAX_AGE = 60 * 60 * 24 * 7
const devRoleOverrideOptions = [
  "owner",
  "admin",
  "manager",
  "employee",
] as const satisfies ReadonlyArray<OrganizationRole>

type DevRoleOverride = (typeof devRoleOverrideOptions)[number]

function isDevRoleOverrideEnabled() {
  return process.env.NODE_ENV !== "production"
}

function getDevRoleOverrideCookieName(organizationId: string) {
  return `${DEV_ROLE_OVERRIDE_COOKIE_PREFIX}_${organizationId}`
}

function readCookieValue(cookieHeader: string, cookieName: string) {
  const prefix = `${cookieName}=`

  for (const cookie of cookieHeader.split(";")) {
    const normalizedCookie = cookie.trim()

    if (normalizedCookie.startsWith(prefix)) {
      return decodeURIComponent(normalizedCookie.slice(prefix.length))
    }
  }

  return null
}

function parseDevRoleOverride(value: string | null) {
  if (!value) {
    return null
  }

  return devRoleOverrideOptions.includes(value as DevRoleOverride)
    ? (value as DevRoleOverride)
    : null
}

function getDevRoleOverride(
  cookieHeader: string | null | undefined,
  organizationId: string,
) {
  if (!isDevRoleOverrideEnabled() || !cookieHeader) {
    return null
  }

  const cookieName = getDevRoleOverrideCookieName(organizationId)
  return parseDevRoleOverride(readCookieValue(cookieHeader, cookieName))
}

function createDevRoleOverrideCookie(
  organizationId: string,
  role: DevRoleOverride | null,
) {
  const cookieName = getDevRoleOverrideCookieName(organizationId)

  if (!role) {
    return `${cookieName}=; Path=/; Max-Age=0; SameSite=Lax`
  }

  return `${cookieName}=${encodeURIComponent(role)}; Path=/; Max-Age=${DEV_ROLE_OVERRIDE_MAX_AGE}; SameSite=Lax`
}

export {
  createDevRoleOverrideCookie,
  devRoleOverrideOptions,
  getDevRoleOverride,
  getDevRoleOverrideCookieName,
  isDevRoleOverrideEnabled,
}
export type { DevRoleOverride }
