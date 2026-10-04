import { z } from "zod"

const profileUpdateSchema = z.object({ name: z.unknown().optional() }).loose()

export { profileUpdateSchema }
