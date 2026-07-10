import { z } from "zod"
import { rotaTemplateNameSchema } from "@/features/rota/schemas/rota-server-schemas"

const workspaceScopedUserSchema = z.object({
  organizationId: z.string().trim().min(1, "Choose an organization.").optional(),
  locationId: z.string().uuid("Choose a valid location.").optional(),
  userId: z.string().trim().min(1, "Choose a user."),
})

const zoneNameSchema = z
  .string()
  .trim()
  .min(1, "Enter a zone name.")
  .max(80, "Zone names must be 80 characters or fewer.")

const getRotaSettingsInputSchema = workspaceScopedUserSchema.refine(
  (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
  "Choose either an organization or a location.",
)

const createZoneInputSchema = workspaceScopedUserSchema.extend({
  locationId: z.string().uuid("Choose a valid location."),
  name: zoneNameSchema,
})

const updateZoneInputSchema = workspaceScopedUserSchema.extend({
  zoneId: z.string().uuid("Choose a valid zone."),
  name: zoneNameSchema,
}).refine(
  (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
  "Choose either an organization or a location.",
)

const deleteZoneInputSchema = workspaceScopedUserSchema.extend({
  zoneId: z.string().uuid("Choose a valid zone."),
}).refine(
  (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
  "Choose either an organization or a location.",
)

const renameRotaTemplateInputSchema = workspaceScopedUserSchema.extend({
  templateId: z.string().uuid("Choose a valid template."),
  name: rotaTemplateNameSchema,
}).refine(
  (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
  "Choose either an organization or a location.",
)

const deleteRotaTemplateInputSchema = workspaceScopedUserSchema.extend({
  templateId: z.string().uuid("Choose a valid template."),
}).refine(
  (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
  "Choose either an organization or a location.",
)

export {
  createZoneInputSchema,
  deleteZoneInputSchema,
  deleteRotaTemplateInputSchema,
  getRotaSettingsInputSchema,
  renameRotaTemplateInputSchema,
  updateZoneInputSchema,
  zoneNameSchema,
}
