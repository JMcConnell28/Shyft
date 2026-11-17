import { z } from "zod"

const billingWorkspaceSchema = z.object({
  organizationId: z.string().trim().min(1),
})

const removeOrganizationSchema = billingWorkspaceSchema.extend({
  confirmationName: z.string().trim().min(1),
})

export { billingWorkspaceSchema, removeOrganizationSchema }
