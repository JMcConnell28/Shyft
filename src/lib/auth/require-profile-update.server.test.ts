import { describe, expect, it, vi } from "vitest"
import { requireAllowedProfileUpdate } from "@/lib/auth/require-profile-update.server"

vi.mock("@tanstack/react-start/server-only", () => ({}))
describe("self-service profile changes", () => {
  it.each(["Changed name", "", null])("blocks name updates (%s)", (name) => {
    expect(() => requireAllowedProfileUpdate({ name })).toThrow(
      "support request"
    )
  })
  it("allows updates to other profile fields", () => {
    expect(() =>
      requireAllowedProfileUpdate({ image: "https://example.com/avatar.png" })
    ).not.toThrow()
  })
})
