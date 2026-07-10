import { z } from "zod"

const searchUsersSchema = z.object({
  search: z.string().trim().max(120).optional(),
})

const updateAppUserStatusSchema = z.object({
  reason: z.string().trim().max(500).optional(),
  status: z.enum(["active", "deactivated"]),
  userId: z.string().min(1),
})

const createImpersonationSessionSchema = z.object({
  reason: z.string().trim().min(5).max(500),
  userId: z.string().min(1),
})

export {
  createImpersonationSessionSchema,
  searchUsersSchema,
  updateAppUserStatusSchema,
}
