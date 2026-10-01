import type { z } from "zod"

import type { accountPreferencesSchema } from "@/features/account/schemas/preference-schemas"

type AccountPreferences = z.infer<typeof accountPreferencesSchema>

export type { AccountPreferences }
