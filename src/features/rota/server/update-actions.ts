import { createServerFn } from "@tanstack/react-start"

import type { PublishRotaVersionResult } from "@/features/rota/types"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import { publishRotaSchema, updateRotaNoteSchema } from "@/lib/rota-schemas"
import { createSupabaseServerClient } from "@/lib/supabase"
import {
  assertSupabaseSuccess,
  getRequiredSupabaseRow,
} from "@/lib/supabase-errors"

import { ensureLocationAccessOrThrow } from "@/features/rota/server/access"
import { getOrganizationSlugById } from "@/features/rota/server/lookups"
const publishRotaVersion = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => publishRotaSchema.parse(input))
  .handler(async ({ data }): Promise<PublishRotaVersionResult> => {
    const { requireVerifiedSessionOrThrow } = await import(
      "@/features/rota/server/request-session"
    )
    const { session } = await requireVerifiedSessionOrThrow()
    const organizationId = session.session.activeOrganizationId

    if (!organizationId) {
      throw new Error("Choose an organization before publishing a rota.")
    }

    const role = await requireOrgPermission({
      organizationId,
      userId: session.user.id,
      permissions: {
        rota: ["publish"],
      },
      errorMessage: "You do not have permission to publish rotas.",
    })
    const supabase = createSupabaseServerClient()
    const lookupResult = await supabase
      .from("rotas")
      .select("location_id, week_start, published_version")
      .eq("id", data.rotaId)
      .eq("organization_id", organizationId)
      .maybeSingle()

    assertSupabaseSuccess(lookupResult.error, "That rota could not be found.")
    const rota = lookupResult.data

    if (!rota) {
      throw new Error("That rota could not be found.")
    }

    const { location } = await ensureLocationAccessOrThrow(
      organizationId,
      session.user.id,
      rota.location_id,
      role,
    )

    const publishResult = await supabase
      .from("rotas")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        published_by_user_id: session.user.id,
        published_version: rota.published_version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.rotaId)
      .eq("organization_id", organizationId)
      .select("id")
      .single()

    assertSupabaseSuccess(publishResult.error, "We could not publish that rota.")
    getRequiredSupabaseRow(
      publishResult.data,
      "We could not publish that rota.",
    )

    const orgSlug = await getOrganizationSlugById(organizationId)

    if (!orgSlug) {
      throw new Error("We could not find that organization workspace.")
    }

    return {
      target: {
        orgSlug,
        locationSlug: location.slug,
        rotaId: data.rotaId,
      },
    }
  })

const updateRotaNote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateRotaNoteSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireVerifiedSessionOrThrow } = await import(
      "@/features/rota/server/request-session"
    )
    const { session } = await requireVerifiedSessionOrThrow()
    const organizationId = session.session.activeOrganizationId

    if (!organizationId) {
      throw new Error("Choose an organization before updating a rota.")
    }

    const role = await requireOrgPermission({
      organizationId,
      userId: session.user.id,
      permissions: {
        rota: ["update"],
      },
      errorMessage: "You do not have permission to update rotas.",
    })
    const supabase = createSupabaseServerClient()
    const lookupResult = await supabase
      .from("rotas")
      .select("location_id")
      .eq("id", data.rotaId)
      .eq("organization_id", organizationId)
      .maybeSingle()

    assertSupabaseSuccess(lookupResult.error, "That rota could not be found.")
    const rota = lookupResult.data

    if (!rota) {
      throw new Error("That rota could not be found.")
    }

    await ensureLocationAccessOrThrow(
      organizationId,
      session.user.id,
      rota.location_id,
      role,
    )

    const noteResult = await supabase
      .from("rotas")
      .update({
        note: data.note.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.rotaId)
      .eq("organization_id", organizationId)

    assertSupabaseSuccess(noteResult.error, "We could not update that rota note.")

    return { success: true }
  })

export { publishRotaVersion, updateRotaNote }

