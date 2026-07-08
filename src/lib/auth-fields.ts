import type { DBFieldAttribute } from "better-auth"

import { dateOfBirthSchema } from "@/lib/onboarding-schemas"

const authUserAdditionalFields = {
  dateOfBirth: {
    type: "string",
    required: true,
    validator: {
      input: dateOfBirthSchema,
    },
  },
} satisfies Record<string, DBFieldAttribute>

export { authUserAdditionalFields }
