import { describe, expect, it, vi } from "vitest"
import { assertLocationNameAvailable } from "./assert-location-name-available"

describe("location name availability", () => {
  it("rejects an existing name regardless of capitalisation or surrounding spaces", async () => {
    const query =
      vi.fn<Parameters<typeof assertLocationNameAvailable>[0]["query"]>()
    query.mockResolvedValue({
      rows: [{ exists: true }],
    })
    await expect(
      assertLocationNameAvailable({ query }, "org-a", "  CAFE  ")
    ).rejects.toThrow("A location with this name already exists")
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(
        "organization_id = $1 and lower(btrim(name)) = lower($2)"
      ),
      ["org-a", "CAFE"]
    )
  })
  it("locks before checking and allows an available name", async () => {
    const query =
      vi.fn<Parameters<typeof assertLocationNameAvailable>[0]["query"]>()
    query.mockResolvedValue({
      rows: [{ exists: false }],
    })
    await expect(
      assertLocationNameAvailable({ query }, "org-b", "  CAFE  ")
    ).resolves.toBeUndefined()
    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("pg_advisory_xact_lock"),
      ["location-creation:org-b"]
    )
    expect(query).toHaveBeenNthCalledWith(2, expect.any(String), [
      "org-b",
      "CAFE",
    ])
  })
})
