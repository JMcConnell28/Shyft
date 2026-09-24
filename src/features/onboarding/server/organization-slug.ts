import { auth } from "@/lib/auth"
import { getErrorMessage } from "@/lib/errors"
import { getOrganizationSlugCandidate } from "@/features/onboarding/utils/organization-slug"

const MAX_SLUG_ATTEMPTS = 50

function isSlugConflict(error: unknown): boolean {
  return /organization already exists|organization slug already taken|duplicate key value.*slug/i.test(
    getErrorMessage(error, "")
  )
}

async function createOrganizationWithGeneratedSlug({
  headers,
  name,
  trialStartedAt,
  trialEndsAt,
}: {
  headers: HeadersInit
  name: string
  trialStartedAt: Date
  trialEndsAt: Date
}) {
  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const slug = getOrganizationSlugCandidate(name, attempt)
    const availability = await auth.api.checkOrganizationSlug({
      headers,
      body: { slug },
    })
    if (!availability.status) continue

    try {
      return await auth.api.createOrganization({
        headers,
        body: {
          name,
          slug,
          metadata: {
            trialStartedAt: trialStartedAt.toISOString(),
            trialEndsAt: trialEndsAt.toISOString(),
          },
        },
      })
    } catch (error) {
      if (!isSlugConflict(error)) throw error
    }
  }

  throw new Error(
    "We could not create a unique workspace URL. Please try again."
  )
}

export { createOrganizationWithGeneratedSlug }
