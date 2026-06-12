import { createServerFn } from "@tanstack/react-start"

import { saveOnboardingIntentSchema } from "@/lib/onboarding-schemas"

const saveOnboardingIntent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => saveOnboardingIntentSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/onboarding/server/intent")
    return module.saveOnboardingIntentForEmail(data)
  })

export { saveOnboardingIntent }
