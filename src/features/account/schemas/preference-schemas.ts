import { z } from "zod"

const accountPreferencesSchema = z.object({
  announcementPushEnabled: z.boolean(),
})

export { accountPreferencesSchema }
