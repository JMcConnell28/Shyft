import { z } from "zod"
import { staffInviteSelectionSchema } from "./onboarding-schemas"

const staffInviteScopeSchema = staffInviteSelectionSchema.pick({
  organizationId: true,
})
const staffInviteRowSchema = z.object({
  id: z.uuid(),
  organization_id: z.string(),
  organization_name: z.string(),
  location_ids: z.array(z.uuid()),
  default_staff_group_id: z.uuid(),
  staff_group_name: z.string(),
  token: z.string(),
  expires_at: z.coerce.date().nullable(),
  disabled_at: z.coerce.date().nullable(),
})
type StaffInviteRow = z.infer<typeof staffInviteRowSchema>
type StaffInviteSelection = z.infer<typeof staffInviteSelectionSchema>

export { staffInviteScopeSchema, staffInviteRowSchema }
export type { StaffInviteRow, StaffInviteSelection }
