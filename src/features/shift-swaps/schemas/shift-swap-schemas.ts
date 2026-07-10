import { z } from "zod"

const shiftSwapWorkspaceInputSchema = z.object({
  organizationId: z.string().trim().min(1).optional(),
  locationId: z.uuid().optional(),
  userId: z.string().trim().min(1),
})

const listShiftSwapPageDataInputSchema = shiftSwapWorkspaceInputSchema

const createSwapRequestInputSchema = shiftSwapWorkspaceInputSchema.extend({
  sourceAssignmentId: z.uuid(),
  targetAssignmentId: z.uuid(),
})

const createCoverRequestInputSchema = shiftSwapWorkspaceInputSchema.extend({
  sourceAssignmentId: z.uuid(),
})

const respondToSwapRequestInputSchema = shiftSwapWorkspaceInputSchema.extend({
  requestId: z.uuid(),
  decision: z.enum(["accept", "decline"]),
})

const offerCoverInputSchema = shiftSwapWorkspaceInputSchema.extend({
  requestId: z.uuid(),
})

const cancelShiftSwapRequestInputSchema = shiftSwapWorkspaceInputSchema.extend({
  requestId: z.uuid(),
})

const managerShiftSwapActionInputSchema = shiftSwapWorkspaceInputSchema.extend({
  requestId: z.uuid(),
  note: z.string().trim().max(500).optional(),
})

export {
  cancelShiftSwapRequestInputSchema,
  createCoverRequestInputSchema,
  createSwapRequestInputSchema,
  listShiftSwapPageDataInputSchema,
  managerShiftSwapActionInputSchema,
  offerCoverInputSchema,
  respondToSwapRequestInputSchema,
}
