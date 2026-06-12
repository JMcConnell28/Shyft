import type {
  LocationSummary,
  OrganizationSummary,
  WorkspaceSummary,
} from "@/features/onboarding/types"
import { auth } from "@/lib/auth"
import {
  getAuthRequestHeaders,
  readSessionFromRequestHeaders,
} from "@/lib/auth-session.server"
import { getDatabase } from "@/lib/db"
import { isEmailVerificationSatisfied } from "@/lib/email-verification"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"


function mapOrganization(organization: {
  id: string
  name: string
  slug: string
}) {
  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
  }
}

async function requireSessionOrThrow() {
  const headers = getAuthRequestHeaders()
  const session = await readSessionFromRequestHeaders()

  if (!session) {
    throw new Error("You need to sign in to continue.")
  }

  return { headers, session }
}

async function requireVerifiedSessionOrThrow() {
  const result = await requireSessionOrThrow()

  if (!isEmailVerificationSatisfied(result.session.user.emailVerified)) {
    throw new Error("Verify your email before continuing.")
  }

  return result
}

async function listOrganizationsForHeaders(headers: HeadersInit) {
  const organizations = await auth.api.listOrganizations({ headers })
  return organizations.map(mapOrganization)
}

async function listLocationWorkspacesForUser(
  userId: string,
): Promise<Array<WorkspaceSummary>> {
  const result = await getDatabase().query<{
    id: string
    name: string
    slug: string
    organization_id: string | null
  }>(
    `select l.id, l.name, l.slug, l.organization_id
     from public.location_memberships lm
     join public.locations l on l.id = lm.location_id
     where lm.user_id = $1
     order by lm.created_at asc`,
    [userId],
  )

  return result.rows.map((location) => ({
    id: location.id,
    name: location.name,
    slug: location.slug,
    type: "location",
    organizationId: location.organization_id,
  }))
}

async function getLocationSummaryBySlug(
  slug: string,
): Promise<LocationSummary | null> {
  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("locations")
    .select("id, name, slug, organization_id")
    .eq("slug", slug)
    .maybeSingle()

  assertSupabaseSuccess(result.error, "We could not load that location.")

  if (!result.data) {
    return null
  }

  return {
    id: result.data.id,
    name: result.data.name,
    slug: result.data.slug,
    organizationId: result.data.organization_id,
  }
}

async function setActiveOrganizationForHeaders(
  headers: HeadersInit,
  organizationId: string,
) {
  await auth.api.setActiveOrganization({
    headers,
    body: {
      organizationId,
    },
  })
}

async function getOrganizationSummaryById(organizationId: string) {
  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("organization")
    .select("id, name, slug")
    .eq("id", organizationId)
    .maybeSingle()

  assertSupabaseSuccess(result.error, "We could not load that organization.")

  return (result.data as OrganizationSummary | null) ?? null
}

export {
  getOrganizationSummaryById,
  getLocationSummaryBySlug,
  listLocationWorkspacesForUser,
  listOrganizationsForHeaders,
  mapOrganization,
  requireSessionOrThrow,
  requireVerifiedSessionOrThrow,
  setActiveOrganizationForHeaders,
}

