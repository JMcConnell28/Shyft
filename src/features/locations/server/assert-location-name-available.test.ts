import { describe, expect, it, vi } from "vitest"
import { assertLocationNameAvailable } from "./assert-location-name-available"

describe("location name availability", () => {
  it("rejects an existing exact name with a helpful message", async () => {
    const query =
      vi.fn<Parameters<typeof assertLocationNameAvailable>[0]["query"]>()
    query.mockResolvedValue({
      rows: [{ exists: true }],
    })
    await expect(
      assertLocationNameAvailable({ query }, "org-a", "Cafe")
    ).rejects.toThrow("A location with this name already exists")
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("organization_id = $1 and name = $2"),
      ["org-a", "Cafe"]
    )
  })
  it("locks before checking and preserves exact capitalisation", async () => {
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
