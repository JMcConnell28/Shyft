import { z } from "zod"

const announcementWorkspaceInputShape = {
  includeArchived: z.boolean().optional(),
  locationId: z.uuid().optional(),
  organizationId: z.string().trim().min(1).optional(),
  userId: z.string().trim().min(1),
}

const announcementWorkspaceInputSchema = withWorkspaceScopeRefinement(
  z.object(announcementWorkspaceInputShape)
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

const announcementPollOptionsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Poll options cannot be empty.")
      .max(120, "Keep poll options under 120 characters.")
  )
  .max(6, "Use no more than 6 poll options.")
  .refine(
    (options) => options.length === 0 || options.length >= 2,
    "Add at least 2 poll options."
  )
  .refine(
    (options) =>
      new Set(options.map((option) => option.toLowerCase())).size ===
      options.length,
    "Poll options must be unique."
  )

const announcementFormShape = {
  body: announcementBodySchema,
  isPinned: z.boolean(),
  pollOptions: announcementPollOptionsSchema,
  targetLocationIds: announcementTargetLocationIdsSchema,
  targetScope: announcementTargetScopeSchema,
  title: announcementTitleSchema,
}

const announcementFormSchema = withTargetRefinement(
  z.object(announcementFormShape)
)

const createAnnouncementInputSchema = withTargetRefinement(
  withWorkspaceScopeRefinement(
    z.object({
      ...announcementWorkspaceInputShape,
      ...announcementFormShape,
    })
  )
)

const updateAnnouncementInputSchema = withTargetRefinement(
  withWorkspaceScopeRefinement(
    z.object({
      ...announcementWorkspaceInputShape,
      ...announcementFormShape,
      announcementId: z.uuid(),
    })
  )
)

const archiveAnnouncementInputSchema = withWorkspaceScopeRefinement(
  z.object({
    ...announcementWorkspaceInputShape,
    announcementId: z.uuid(),
  })
)

const markAnnouncementReadInputSchema = withWorkspaceScopeRefinement(
  z.object({
    ...announcementWorkspaceInputShape,
    announcementId: z.uuid(),
  })
)

const markAllAnnouncementsReadInputSchema = announcementWorkspaceInputSchema

const voteAnnouncementPollInputSchema = withWorkspaceScopeRefinement(
  z.object({
    ...announcementWorkspaceInputShape,
    announcementId: z.uuid(),
    optionId: z.uuid(),
  })
)

function withWorkspaceScopeRefinement<
  TSchema extends z.ZodObject<z.core.$ZodLooseShape>,
>(schema: TSchema) {
  return schema.refine(
    (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
    "Choose one workspace."
  )
}

function withTargetRefinement<
  TSchema extends z.ZodObject<z.core.$ZodLooseShape>,
>(schema: TSchema) {
  return schema.refine(
    (value) =>
      value.targetScope === "organization" ||
      (Array.isArray(value.targetLocationIds) &&
        value.targetLocationIds.length > 0),
    {
      message: "Choose at least one location.",
      path: ["targetLocationIds"],
    }
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
  voteAnnouncementPollInputSchema,
}
