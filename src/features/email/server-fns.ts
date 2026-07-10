import { createServerFn } from "@tanstack/react-start"

import { sendDevTestEmailInputSchema } from "@/features/email/schemas/dev-email-schemas"

const sendDevTestEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => sendDevTestEmailInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/email/server/dev-email-actions")
    return module.sendDevTestEmail(data)
  })

export { sendDevTestEmail }
