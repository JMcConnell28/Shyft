import "@tanstack/react-start/server-only"

import { createSupabaseServerClient } from "@/lib/supabase.server"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"

type TrialRotaUsageScope = {
  organizationId: string | null
  locationId: string
}

async function countWorkspaceTrialRotas({
  organizationId,
  locationId,
}: TrialRotaUsageScope) {
  const supabase = createSupabaseServerClient()
  const query = supabase.from("rotas").select("id", {
    count: "exact",
    head: true,
  })

  const result = organizationId
    ? await query.eq("organization_id", organizationId)
    : await query.eq("location_id", locationId).is("organization_id", null)

  assertSupabaseSuccess(result.error, "We could not count workspace rotas.")

  return result.count ?? 0
}

export { countWorkspaceTrialRotas }
export type { TrialRotaUsageScope }
