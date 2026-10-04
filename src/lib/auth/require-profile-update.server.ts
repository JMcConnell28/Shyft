import "@tanstack/react-start/server-only"

import { APIError } from "better-auth/api"

import { profileUpdateSchema } from "@/lib/auth/profile-update-schema"

function requireAllowedProfileUpdate(body: unknown): void {
  const result = profileUpdateSchema.safeParse(body)
  if (result.success && result.data.name !== undefined) {
    throw new APIError("FORBIDDEN", {
      message: "Name changes require a manager to submit a support request.",
    })
  }
}

export { requireAllowedProfileUpdate }
