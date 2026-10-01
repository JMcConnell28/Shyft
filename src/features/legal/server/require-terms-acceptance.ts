import "@tanstack/react-start/server-only"

import { APIError } from "better-auth/api"

import { termsVersion } from "@/features/legal/terms"

function requireTermsAcceptance(value: unknown): void {
  if (value !== termsVersion) {
    throw new APIError("FORBIDDEN", {
      message: "You must agree to the current Terms and Conditions to continue.",
    })
  }
}

export { requireTermsAcceptance }
