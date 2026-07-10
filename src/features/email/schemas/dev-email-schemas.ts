import { z } from "zod"

import { devEmailOptions } from "@/features/email/constants/dev-email-options"

const devEmailTypeSchema = z.enum(
  devEmailOptions.map((option) => option.value) as [
    (typeof devEmailOptions)[number]["value"],
    ...(typeof devEmailOptions)[number]["value"][],
  ],
)

const sendDevTestEmailInputSchema = z.object({
  emailType: devEmailTypeSchema,
  workspaceSlug: z.string().trim().min(1).optional(),
  workspaceType: z.enum(["location", "organization"]).optional(),
})

export { devEmailTypeSchema, sendDevTestEmailInputSchema }
