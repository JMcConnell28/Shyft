import { z } from "zod"

const organizationScopedUserSchema = z.object({
  organizationId: z.string().trim().min(1, "Choose an organization."),
  userId: z.string().trim().min(1, "Choose a user."),
})

const getOrgCapabilitiesInputSchema = organizationScopedUserSchema

const getWorkspaceCapabilitiesInputSchema = z
  .object({
    organizationId: z.string().trim().min(1).optional(),
    locationId: z.string().trim().min(1).optional(),
    userId: z.string().trim().min(1, "Choose a user."),
  })
  .refine((input) => Boolean(input.organizationId) !== Boolean(input.locationId), {
    message: "Choose one workspace.",
  })

export {
  getOrgCapabilitiesInputSchema,
  getWorkspaceCapabilitiesInputSchema,
  organizationScopedUserSchema,
}
