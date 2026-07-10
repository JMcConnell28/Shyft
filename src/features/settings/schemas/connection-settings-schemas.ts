import { z } from "zod"

import { organizationSetupSchema } from "@/lib/onboarding-schemas"

const workspaceConnectionsInputSchema = z
  .object({
    organizationId: z.string().trim().min(1).optional(),
    locationId: z.string().uuid().optional(),
    userId: z.string().trim().min(1).optional(),
  })
  .refine(
    (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
    "Choose either an organization or a location.",
  )

const moveLocationToOrganizationInputSchema = z.object({
  locationId: z.string().uuid(),
  targetOrganizationId: z.string().trim().min(1),
  billingMode: z.enum(["keep", "organization"]),
})

const moveLocationToOrganizationBillingInputSchema = z.object({
  locationId: z.string().uuid(),
  organizationId: z.string().trim().min(1),
})

const createOrganizationFromLocationInputSchema = organizationSetupSchema.extend({
  locationId: z.string().uuid(),
  billingMode: z.enum(["keep", "organization"]),
})

export {
  createOrganizationFromLocationInputSchema,
  moveLocationToOrganizationBillingInputSchema,
  moveLocationToOrganizationInputSchema,
  workspaceConnectionsInputSchema,
}
