import type { DBFieldAttribute } from "better-auth"

// Generic auth endpoints must never accept permission or account-status changes.
const adminUserAdditionalFields = {
  role: {
    type: "string",
    required: false,
    defaultValue: "readonly",
    input: false,
  },
  disabledAt: {
    type: "date",
    required: false,
    fieldName: "disabled_at",
    input: false,
  },
} satisfies Record<string, DBFieldAttribute>

export { adminUserAdditionalFields }
