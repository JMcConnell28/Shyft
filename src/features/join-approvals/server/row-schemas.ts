import { z } from "zod"

const joinRequestStatusSchema = z.enum(["pending", "approved", "denied"])
const lockedJoinRequestSchema = z.object({
  organization_id: z.string(),
  location_ids: z.array(z.uuid()),
  staff_group_id: z.uuid().nullable(),
  user_id: z.string(),
  status: joinRequestStatusSchema,
  name: z.string(),
  email: z.string(),
  dateOfBirth: z.string().nullable(),
})
const joinRequestRowSchema = z.object({
  id: z.uuid(),
  organization_id: z.string(),
  organization_name: z.string(),
  organization_slug: z.string(),
  location_names: z.array(z.string()),
  staff_group_name: z.string().nullable(),
  user_name: z.string(),
  user_email: z.string(),
  status: joinRequestStatusSchema,
  created_at: z.coerce.date(),
  decided_at: z.coerce.date().nullable(),
})
type JoinRequestRow = z.infer<typeof joinRequestRowSchema>
type LockedJoinRequest = z.infer<typeof lockedJoinRequestSchema>

export { joinRequestRowSchema, lockedJoinRequestSchema }
export type { JoinRequestRow, LockedJoinRequest }
