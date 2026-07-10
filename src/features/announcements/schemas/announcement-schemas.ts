import { z } from "zod"

const announcementWorkspaceInputShape = {
  includeArchived: z.boolean().optional(),
  locationId: z.uuid().optional(),
  organizationId: z.string().trim().min(1).optional(),
  userId: z.string().trim().min(1),
}

const announcementWorkspaceInputSchema = withWorkspaceScopeRefinement(
  z.object(announcementWorkspaceInputShape),
)

const announcementTitleSchema = z
  .string()
  .trim()
  .min(3, "Use at least 3 characters.")
  .max(120, "Keep the title under 120 characters.")

const announcementBodySchema = z
  .string()
  .trim()
  .min(1, "Write an announcement.")
  .max(4000, "Keep the announcement under 4000 characters.")

const announcementTargetScopeSchema = z.enum(["organization", "locations"])

const announcementTargetLocationIdsSchema = z
  .array(z.uuid())
  .max(50, "Choose fewer locations.")

const announcementFormShape = {
  body: announcementBodySchema,
  targetLocationIds: announcementTargetLocationIdsSchema,
  targetScope: announcementTargetScopeSchema,
  title: announcementTitleSchema,
}

const announcementFormSchema = withTargetRefinement(
  z.object(announcementFormShape),
)

const createAnnouncementInputSchema = withTargetRefinement(
  withWorkspaceScopeRefinement(
    z.object({
      ...announcementWorkspaceInputShape,
      ...announcementFormShape,
    }),
  ),
)

const updateAnnouncementInputSchema = withTargetRefinement(
  withWorkspaceScopeRefinement(
    z.object({
      ...announcementWorkspaceInputShape,
      ...announcementFormShape,
      announcementId: z.uuid(),
    }),
  ),
)

const archiveAnnouncementInputSchema = withWorkspaceScopeRefinement(
  z.object({
    ...announcementWorkspaceInputShape,
    announcementId: z.uuid(),
  }),
)

const markAnnouncementReadInputSchema = withWorkspaceScopeRefinement(
  z.object({
    ...announcementWorkspaceInputShape,
    announcementId: z.uuid(),
  }),
)

const markAllAnnouncementsReadInputSchema = announcementWorkspaceInputSchema

function withWorkspaceScopeRefinement<
  Schema extends z.ZodObject<z.core.$ZodLooseShape>,
>(schema: Schema) {
  return schema.refine(
    (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
    "Choose one workspace.",
  )
}

function withTargetRefinement<
  Schema extends z.ZodObject<z.core.$ZodLooseShape>,
>(schema: Schema) {
  return schema.refine(
    (value) =>
      value.targetScope === "organization" ||
      (Array.isArray(value.targetLocationIds) &&
        value.targetLocationIds.length > 0),
    {
      message: "Choose at least one location.",
      path: ["targetLocationIds"],
    },
  )
}

export {
  announcementFormSchema,
  archiveAnnouncementInputSchema,
  createAnnouncementInputSchema,
  markAllAnnouncementsReadInputSchema,
  markAnnouncementReadInputSchema,
  announcementWorkspaceInputSchema,
  updateAnnouncementInputSchema,
}
export type AnnouncementFormInput = z.infer<typeof announcementFormSchema>
