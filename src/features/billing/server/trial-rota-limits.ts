import "@tanstack/react-start/server-only"

import { TRIAL_ROTA_LIMIT } from "@/features/billing/constants"
import { requireLocationPaidWriteAccess } from "@/features/billing/server/entitlements"
import { countWorkspaceTrialRotas } from "@/features/billing/server/trial-rota-usage"
import { getOptionalEnv } from "@/lib/env.server"

type TrialRotaWorkspace = {
  organizationId: string | null
  locationId: string
}

const EXEMPT_ORGANIZATION_IDS_ENV = "TRIAL_ROTA_LIMIT_EXEMPT_ORGANIZATION_IDS"
const EXEMPT_LOCATION_IDS_ENV = "TRIAL_ROTA_LIMIT_EXEMPT_LOCATION_IDS"

function parseIdList(value: string | undefined) {
  return new Set(
    (value ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
  )
}

function isTrialRotaLimitExempt(input: TrialRotaWorkspace) {
  const exemptOrganizationIds = parseIdList(
    getOptionalEnv(EXEMPT_ORGANIZATION_IDS_ENV)
  )
  const exemptLocationIds = parseIdList(getOptionalEnv(EXEMPT_LOCATION_IDS_ENV))

  return Boolean(
    (input.organizationId && exemptOrganizationIds.has(input.organizationId)) ||
    exemptLocationIds.has(input.locationId)
  )
}

async function assertTrialRotaCreationAllowed(input: TrialRotaWorkspace) {
  const entitlement = await requireLocationPaidWriteAccess(input.locationId)

  if (isTrialRotaLimitExempt(input)) {
    return
  }

  if (entitlement.accessState !== "trial") {
    return
  }

  const rotaCount = await countWorkspaceTrialRotas(input)

  if (rotaCount >= TRIAL_ROTA_LIMIT) {
    throw new Error(
      `Your trial includes up to ${TRIAL_ROTA_LIMIT} rotas. Upgrade to create more.`
    )
  }
}

export { assertTrialRotaCreationAllowed, TRIAL_ROTA_LIMIT }
