import { createServerFn } from "@tanstack/react-start"

import { accountPreferencesSchema } from "@/features/account/schemas/preference-schemas"

const getAccountPreferences = createServerFn({ method: "GET" }).handler(
  async () => {
    const module = await import("@/features/account/server/preferences")
    return module.getAccountPreferences()
  }
)

const updateAccountPreferences = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => accountPreferencesSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/account/server/preferences")
    return module.updateAccountPreferences(data)
  })

export { getAccountPreferences, updateAccountPreferences }
