import "@tanstack/react-start/server-only"

import type { ClockTagSummary } from "@/features/time-clock/types/clock-tag"
import { clockTagSummaryRowsSchema } from "@/features/time-clock/schemas/clock-tag-summary-schema"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"

async function listClockTagSummariesByLocation(
  locationIds: Array<string>
): Promise<Map<string, Array<ClockTagSummary>>> {
  const tagsByLocationId = new Map<string, Array<ClockTagSummary>>()
  if (locationIds.length === 0) return tagsByLocationId

  const result = await createSupabaseServerClient()
    .from("clock_tags")
    // Customer settings need station metadata, never provisioning keys.
    .select("id, location_id, label, ntag_public_id, ntag_last_seen_counter")
    .in("location_id", locationIds)
    .eq("is_active", true)
    .is("disabled_at", null)
    .not("ntag_public_id", "is", null)
    .not("ntag_aes_key_hex", "is", null)
    .order("created_at", { ascending: false })

  assertSupabaseSuccess(result.error, "We could not load clock tags.")
  const rows = clockTagSummaryRowsSchema.parse(result.data ?? [])
  for (const row of rows) {
    const tags = tagsByLocationId.get(row.location_id) ?? []
    tags.push({
      id: row.id,
      label: row.label,
      lastSeenCounter: row.ntag_last_seen_counter,
      publicId: row.ntag_public_id,
    })
    tagsByLocationId.set(row.location_id, tags)
  }
  return tagsByLocationId
}

export { listClockTagSummariesByLocation }
