import { z } from "zod"

import { assignableOrganizationRoles } from "@/lib/auth/permissions"
import { slugify } from "@/lib/slug"

const personNameSchema = z
  .string()
  .trim()
  .min(2, "Enter your full name.")
  .max(80, "Name is too long.")

const emailSchema = z.string().trim().email("Enter a valid email address.")

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.")

const organizationNameSchema = z
  .string()
  .trim()
  .min(2, "Enter an organization name.")
  .max(80, "Organization name is too long.")

const organizationSlugSchema = z
  .string()
  .trim()
  .min(2, "Use at least 2 characters.")
  .max(48, "Use 48 characters or fewer.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and hyphens only.",
  )

const locationNameSchema = z
  .string()
  .trim()
  .min(2, "Enter your first location name.")
  .max(80, "Location name is too long.")

const zoneNameSchema = z
  .string()
  .trim()
  .max(80, "Zone name is too long.")

const inviteLinkSchema = z
  .string()
  .trim()
  .min(1, "Paste an invite link or token.")

const staffInviteSelectionSchema = z.object({
  locationId: z.string().uuid("Choose a location."),
  defaultStaffGroupId: z.string().uuid("Choose a staff group."),
})

const organizationMemberInviteSchema = z.object({
  email: emailSchema,
  role: z.enum(assignableOrganizationRoles),
})

const signUpSchema = z.object({
  name: personNameSchema,
  email: emailSchema,
  password: passwordSchema,
})

const organizationSetupSchema = z.object({
  name: organizationNameSchema,
  slug: organizationSlugSchema,
})

const locationSetupSchema = z.object({
  locationName: locationNameSchema,
  zoneName: zoneNameSchema.optional().default(""),
})

const verifyEmailSchema = z.object({
  email: emailSchema,
  callbackURL: z.string().trim().min(1).default("/dashboard"),
})

const acceptInviteSchema = z.object({
  token: z.string().trim().min(10, "Invite link is invalid."),
})

const acceptOrganizationInvitationSchema = z.object({
  invitationId: z.string().trim().min(1, "Invitation is invalid."),
})

const activateOrganizationSchema = z.object({
  organizationId: z.string().trim().min(1, "Choose an organization."),
})

const organizationRouteParamsSchema = z.object({
  orgSlug: organizationSlugSchema,
})

function normalizeOrganizationSlug(value: string) {
  return slugify(value).slice(0, 48)
}

function normalizeZoneName(value: string | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : "Zone 1"
}

function extractInviteDestination(value: string) {
  const normalized = value.trim()

  if (!normalized) {
    return null
  }

  const parsePath = (path: string) => {
    const joinMatch = path.match(/\/join\/([^/?#]+)/i)

    if (joinMatch) {
      return {
        to: `/join/${joinMatch[1]}` as const,
      }
    }

    const organizationInviteMatch = path.match(
      /\/accept-invitation\/([^/?#]+)/i,
    )

    if (organizationInviteMatch) {
      return {
        to: `/accept-invitation/${organizationInviteMatch[1]}` as const,
      }
    }

    return null
  }

  try {
    const url = new URL(normalized)
    return parsePath(url.pathname)
  } catch {
    if (normalized.startsWith("/")) {
      return parsePath(normalized)
    }

    const staffTokenMatch = normalized.match(/^[a-zA-Z0-9_-]{16,}$/)

    if (staffTokenMatch) {
      return {
        to: `/join/${normalized}` as const,
      }
    }

    return null
  }
}

export {
  acceptInviteSchema,
  acceptOrganizationInvitationSchema,
  activateOrganizationSchema,
  emailSchema,
  extractInviteDestination,
  inviteLinkSchema,
  locationNameSchema,
  locationSetupSchema,
  normalizeOrganizationSlug,
  normalizeZoneName,
  organizationMemberInviteSchema,
  organizationNameSchema,
  organizationRouteParamsSchema,
  organizationSetupSchema,
  organizationSlugSchema,
  passwordSchema,
  personNameSchema,
  signUpSchema,
  staffInviteSelectionSchema,
  verifyEmailSchema,
  zoneNameSchema,
}
