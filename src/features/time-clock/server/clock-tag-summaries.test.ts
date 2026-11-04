import { beforeEach, describe, expect, it, vi } from "vitest"
import { listClockTagSummariesByLocation } from "./clock-tag-summaries"

const { query, select } = vi.hoisted(() => ({
  query: vi.fn(),
  select: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/supabase.server", () => ({
  createSupabaseServerClient: () => {
    const chain = {
      select,
      in: () => chain,
      eq: () => chain,
      is: () => chain,
      not: () => chain,
      order: query,
    }
    select.mockReturnValue(chain)
    return { from: () => chain }
  },
}))

const locationId = "00000000-0000-4000-8000-000000000001"
const row = {
  id: "00000000-0000-4000-8000-000000000002",
  location_id: locationId,
  label: "Station",
  ntag_public_id: "clk_00000000000000000000000000000000",
  ntag_last_seen_counter: 25,
  ntag_aes_key_hex: "secret-fixture-key",
  token_hash: "secret-fixture-token-hash",
}

beforeEach(() => vi.resetAllMocks())

describe("customer clock tag summaries", () => {
  it("preserves station metadata without fetching or returning provisioning secrets", async () => {
    query.mockResolvedValue({ data: [row], error: null })
    const result = await listClockTagSummariesByLocation([locationId])
    expect(select).toHaveBeenCalledWith(
      "id, location_id, label, ntag_public_id, ntag_last_seen_counter"
    )
    expect(result.get(locationId)).toEqual([
      {
        id: row.id,
        label: row.label,
        lastSeenCounter: 25,
        publicId: row.ntag_public_id,
      },
    ])
    const serialized = JSON.stringify([...result.values()])
    expect(serialized).not.toMatch(
      /aesKeyHex|ntag_aes_key_hex|token_hash|secret-fixture/
    )
  })

  it("does not fetch tags when there are no permitted locations", async () => {
    expect(await listClockTagSummariesByLocation([])).toEqual(new Map())
    expect(query).not.toHaveBeenCalled()
  })

  it("reports database failures instead of silently hiding stations", async () => {
    query.mockResolvedValue({ data: null, error: { message: "denied" } })
    await expect(listClockTagSummariesByLocation([locationId])).rejects.toThrow(
      "We could not load clock tags."
    )
  })

  it("rejects malformed station metadata at the database boundary", async () => {
    query.mockResolvedValue({
      data: [{ ...row, ntag_last_seen_counter: -1 }],
      error: null,
    })
    await expect(
      listClockTagSummariesByLocation([locationId])
    ).rejects.toThrow()
  })
})
