import { z } from "zod"

import { timeAttendanceDeliveryAddressSchema } from "@/features/billing/schemas/time-attendance-addon-schemas"
import { assignableOrganizationRoles } from "@/lib/auth/permissions"
import { slugify } from "@/lib/slug"

const personNameSchema = z
  .string()
  .trim()
  .min(2, "Enter your full name.")
  .max(80, "Name is too long.")

const firstNameSchema = z
  .string()
  .trim()
  .min(1, "Enter your first name.")
  .max(40, "First name is too long.")

const lastNameSchema = z
  .string()
  .trim()
  .min(1, "Enter your last name.")
  .max(40, "Last name is too long.")

const emailSchema = z.string().trim().email("Enter a valid email address.")

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.")

const isoDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")

const dateOfBirthSchema = isoDateSchema.superRefine((value, context) => {
  const dateOfBirth = new Date(`${value}T00:00:00.000Z`)
  const today = new Date()
  const earliestDateOfBirth = new Date(
    Date.UTC(
      today.getUTCFullYear() - 120,
      today.getUTCMonth(),
      today.getUTCDate()
    )
  )

  if (Number.isNaN(dateOfBirth.getTime())) {
    context.addIssue({
      code: "custom",
      message: "Enter a valid date of birth.",
    })
    return
  }

  if (dateOfBirth > today) {
    context.addIssue({
      code: "custom",
      message: "Date of birth cannot be in the future.",
    })
  }

  if (dateOfBirth < earliestDateOfBirth) {
    context.addIssue({
      code: "custom",
      message: "Enter a realistic date of birth.",
    })
  }
})

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
    "Use lowercase letters, numbers, and hyphens only."
  )

const locationNameSchema = z
  .string()
  .trim()
  .min(2, "Enter your first location name.")
  .max(80, "Location name is too long.")

const zoneNameSchema = z
  .string()
  .trim()
  .min(2, "Area name must be at least 2 characters.")
  .max(80, "Zone name is too long.")

const worksiteNameSchema = z
  .string()
  .trim()
  .min(2, "Worksite name must be at least 2 characters.")
  .max(80, "Worksite name is too long.")

const onboardingBusinessTypeSchema = z.enum([
  "hospitality",
  "retail",
  "salon_clinic_venue",
  "cleaning",
  "security",
  "mobile_events_contracts",
])

const onboardingPlanningModeSchema = z.enum([
  "fixed_location",
  "variable_location",
])

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
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  dateOfBirth: dateOfBirthSchema,
  email: emailSchema,
  password: passwordSchema,
})

const onboardingIntentSchema = z.enum(["manage", "join"])

const saveOnboardingIntentSchema = z.object({
  email: emailSchema,
  intent: onboardingIntentSchema,
})

const organizationSetupSchema = z.object({
  name: organizationNameSchema,
  slug: organizationSlugSchema,
})

const fixedBusinessTypes = [
  "hospitality",
  "retail",
  "salon_clinic_venue",
] as const

const variableBusinessTypes = [
  "cleaning",
  "security",
  "mobile_events_contracts",
] as const

const locationSetupSchema = z
  .object({
    businessType: onboardingBusinessTypeSchema,
    planningMode: onboardingPlanningModeSchema,
    locationName: locationNameSchema,
    zoneNames: z
      .array(zoneNameSchema)
      .max(6, "Use 6 areas or fewer.")
      .default([]),
    worksiteName: z
      .string()
      .trim()
      .max(80, "Worksite name is too long.")
      .optional()
      .default(""),
    includeOwnerAsEmployee: z.boolean().default(false),
    timeAttendanceEnabled: z.boolean().default(false),
    timeAttendanceDeliveryAddress:
      timeAttendanceDeliveryAddressSchema.optional(),
  })
  .superRefine((value, context) => {
    const isFixedBusiness = fixedBusinessTypes.includes(
      value.businessType as (typeof fixedBusinessTypes)[number]
    )
    const isVariableBusiness = variableBusinessTypes.includes(
      value.businessType as (typeof variableBusinessTypes)[number]
    )

    if (value.planningMode === "fixed_location" && !isFixedBusiness) {
      context.addIssue({
        code: "custom",
        path: ["planningMode"],
        message: "Choose a fixed-workplace business type.",
      })
    }

    if (value.planningMode === "variable_location" && !isVariableBusiness) {
      context.addIssue({
        code: "custom",
        path: ["planningMode"],
        message: "Choose a variable-location business type.",
      })
    }

    if (
      value.planningMode === "fixed_location" &&
      value.zoneNames.length === 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["zoneNames"],
        message: "Choose at least one area.",
      })
    }

    if (
      value.planningMode === "variable_location" &&
      value.worksiteName &&
      !worksiteNameSchema.safeParse(value.worksiteName).success
    ) {
      context.addIssue({
        code: "custom",
        path: ["worksiteName"],
        message: "Worksite name must be between 2 and 80 characters.",
      })
    }

    if (value.timeAttendanceEnabled && !value.timeAttendanceDeliveryAddress) {
      context.addIssue({
        code: "custom",
        path: ["timeAttendanceDeliveryAddress"],
        message: "Enter a delivery address for the clock-in station.",
      })
    }
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
      /\/accept-invitation\/([^/?#]+)/i
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

type LocationSetupInput = z.infer<typeof locationSetupSchema>
type OnboardingBusinessType = z.infer<typeof onboardingBusinessTypeSchema>
type OnboardingPlanningMode = z.infer<typeof onboardingPlanningModeSchema>

export {
  acceptInviteSchema,
  acceptOrganizationInvitationSchema,
  activateOrganizationSchema,
  dateOfBirthSchema,
  emailSchema,
  firstNameSchema,
  extractInviteDestination,
  inviteLinkSchema,
  lastNameSchema,
  locationNameSchema,
  locationSetupSchema,
  normalizeOrganizationSlug,
  normalizeZoneName,
  onboardingBusinessTypeSchema,
  organizationMemberInviteSchema,
  organizationNameSchema,
  organizationRouteParamsSchema,
  organizationSetupSchema,
  organizationSlugSchema,
  passwordSchema,
  personNameSchema,
  onboardingPlanningModeSchema,
  onboardingIntentSchema,
  saveOnboardingIntentSchema,
  signUpSchema,
  staffInviteSelectionSchema,
  verifyEmailSchema,
  worksiteNameSchema,
  zoneNameSchema,
}

export type {
  LocationSetupInput,
  OnboardingBusinessType,
  OnboardingPlanningMode,
}
