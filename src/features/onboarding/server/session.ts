import { getRequestHeaders } from "@tanstack/react-start/server"

import type { OrganizationSummary } from "@/features/onboarding/types"
import { auth } from "@/lib/auth"
import { isEmailVerificationSatisfied } from "@/lib/email-verification"
import { createSupabaseServerClient } from "@/lib/supabase"
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
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

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
  listOrganizationsForHeaders,
  mapOrganization,
  requireSessionOrThrow,
  requireVerifiedSessionOrThrow,
  setActiveOrganizationForHeaders,
}

