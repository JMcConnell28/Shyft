import { describe, expect, it } from "vitest"

import { requireTermsAcceptance } from "@/features/legal/server/require-terms-acceptance"
import { termsVersion } from "@/features/legal/terms"

describe("terms acceptance", () => {
  it("requires the current terms version at the sign-up boundary", () => {
    expect(() => requireTermsAcceptance(termsVersion)).not.toThrow()
    expect(() => requireTermsAcceptance(undefined)).toThrow()
    expect(() => requireTermsAcceptance("outdated-version")).toThrow()
  })
})
