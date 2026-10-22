import "@tanstack/react-start/server-only"

import { APIError } from "better-auth/api"

import { adminProfileUpdateSchema } from "@/features/auth/schemas/admin-profile-update-schema"

function requireAllowedAdminProfileUpdate(body: unknown): void {
  if (!adminProfileUpdateSchema.safeParse(body).success) {
    throw new APIError("FORBIDDEN", {
      message:
        "Roles and account status cannot be changed through profile updates.",
    })
  }
}

export { requireAllowedAdminProfileUpdate }
