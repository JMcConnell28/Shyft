import { z } from "zod"

import { organizationSlugSchema } from "@/features/onboarding/schemas/onboarding-schemas"
import {
  isoDateSchema,
  locationSlugSchema,
  rotaPageSizeSchema,
  rotaRangeFilterSchema,
  rotaStatusFilterSchema,
} from "@/features/rota/schemas/rota-schemas"
import { shiftTimePattern } from "@/features/rota/utils/shift-time"

const organizationScopedUserSchema = z.object({
  organizationId: z.string().trim().min(1, "Choose an organization.").optional(),
  locationId: z.uuid().optional(),
  userId: z.string().trim().min(1, "Choose a user."),
})

const normalizedRotaListSearchSchema = z.object({
  location: locationSlugSchema.optional(),
  status: rotaStatusFilterSchema,
  range: rotaRangeFilterSchema,
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
  page: z.number().int().min(1),
  pageSize: rotaPageSizeSchema,
})

const getHasUnreadRotaUpdatesInputSchema = organizationScopedUserSchema

const getRotaListPageDataInputSchema = organizationScopedUserSchema.extend({
  orgSlug: organizationSlugSchema.optional(),
  locationSlug: locationSlugSchema.optional(),
  search: normalizedRotaListSearchSchema,
})

const getRotaDetailPageDataInputSchema = organizationScopedUserSchema.extend({
  orgSlug: organizationSlugSchema.optional(),
  locationSlug: locationSlugSchema,
  rotaId: z.uuid(),
})

const getRotaWorkspaceDataInputSchema = getRotaDetailPageDataInputSchema.extend({
  publishedOnly: z.boolean().default(false),
})

const shiftTimeSchema = z
  .string()
  .regex(shiftTimePattern, "Choose a valid shift time.")

const workspaceShiftSegmentSchema = z.object({
  startTime: shiftTimeSchema,
  endTime: shiftTimeSchema,
})

const workspaceClosingShiftSegmentSchema = z.object({
  startTime: shiftTimeSchema,
  endKind: z.literal("locationClose"),
})

const createWorkspaceShiftInputSchema = z.discriminatedUnion("shiftType", [
  z.object({
    dayId: z.string().min(1),
    zoneId: z.string().uuid(),
    shiftType: z.literal("standard"),
    startTime: shiftTimeSchema,
    endTime: shiftTimeSchema,
  }),
  z.object({
    dayId: z.string().min(1),
    zoneId: z.string().uuid(),
    shiftType: z.literal("closing"),
    startTime: shiftTimeSchema,
    endKind: z.literal("locationClose"),
  }),
  z.object({
    dayId: z.string().min(1),
    zoneId: z.string().uuid(),
    shiftType: z.literal("split"),
    segments: z.tuple([
      workspaceShiftSegmentSchema,
      z.union([workspaceShiftSegmentSchema, workspaceClosingShiftSegmentSchema]),
    ]),
  }),
])

const createRotaShiftInputSchema = z.object({
  rotaId: z.uuid(),
  shift: createWorkspaceShiftInputSchema,
})

const saveWorkspaceShiftInputSchema = z.discriminatedUnion("shiftType", [
  z.object({
    id: z.string().min(1),
    dayId: z.string().min(1),
    zoneId: z.string().min(1),
    zoneName: z.string().trim().min(1).max(80).optional(),
    shiftType: z.literal("standard"),
    startTime: shiftTimeSchema,
    endTime: shiftTimeSchema,
  }),
  z.object({
    id: z.string().min(1),
    dayId: z.string().min(1),
    zoneId: z.string().min(1),
    zoneName: z.string().trim().min(1).max(80).optional(),
    shiftType: z.literal("closing"),
    startTime: shiftTimeSchema,
    endKind: z.literal("locationClose"),
  }),
  z.object({
    id: z.string().min(1),
    dayId: z.string().min(1),
    zoneId: z.string().min(1),
    zoneName: z.string().trim().min(1).max(80).optional(),
    shiftType: z.literal("split"),
    segments: z.tuple([
      workspaceShiftSegmentSchema,
      z.union([workspaceShiftSegmentSchema, workspaceClosingShiftSegmentSchema]),
    ]),
  }),
])

const saveWorkspaceAssignmentInputSchema = z.object({
  id: z.string().min(1),
  employeeId: z.string().uuid(),
  shiftId: z.string().min(1),
})

const saveRotaWorkspaceInputSchema = z.object({
  rotaId: z.uuid(),
  shifts: z.array(saveWorkspaceShiftInputSchema),
  assignments: z.array(saveWorkspaceAssignmentInputSchema),
})

const assignRotaShiftEmployeeInputSchema = z.object({
  rotaId: z.uuid(),
  shiftId: z.uuid(),
  employeeId: z.string().min(1),
})

const moveRotaShiftAssignmentInputSchema = z.object({
  rotaId: z.uuid(),
  assignmentId: z.uuid(),
  shiftId: z.uuid(),
})

const removeRotaShiftAssignmentInputSchema = z.object({
  rotaId: z.uuid(),
  assignmentId: z.uuid(),
})

const copyRotaBoardInputSchema = z.object({
  rotaId: z.uuid(),
  mode: z.enum(["full", "shifts-only"]),
})

const rotaTemplateNameSchema = z
  .string()
  .trim()
  .min(1, "Enter a template name.")
  .max(80, "Template names must be 80 characters or fewer.")

const createRotaTemplateFromRotaInputSchema = z.object({
  rotaId: z.uuid(),
  name: rotaTemplateNameSchema,
})

const overrideRotaTemplateFromRotaInputSchema = z.object({
  rotaId: z.uuid(),
  templateId: z.uuid(),
})

const applyRotaTemplateToRotaInputSchema = z.object({
  rotaId: z.uuid(),
  templateId: z.uuid(),
})

export {
  assignRotaShiftEmployeeInputSchema,
  applyRotaTemplateToRotaInputSchema,
  copyRotaBoardInputSchema,
  createRotaTemplateFromRotaInputSchema,
  createRotaShiftInputSchema,
  createWorkspaceShiftInputSchema,
  getHasUnreadRotaUpdatesInputSchema,
  getRotaDetailPageDataInputSchema,
  getRotaListPageDataInputSchema,
  getRotaWorkspaceDataInputSchema,
  moveRotaShiftAssignmentInputSchema,
  overrideRotaTemplateFromRotaInputSchema,
  removeRotaShiftAssignmentInputSchema,
  rotaTemplateNameSchema,
  saveRotaWorkspaceInputSchema,
}
