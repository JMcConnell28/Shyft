import "@tanstack/react-start/server-only"

import { TRIAL_ROTA_LIMIT } from "@/features/billing/constants"
import { getLocationEntitlement } from "@/features/billing/server/entitlements"
import { ensureWorkspaceTrial } from "@/features/billing/server/trials"
import { getOrganizationBillingAccess } from "@/features/billing/server/billing-accounts"
import { countWorkspaceTrialRotas } from "@/features/billing/server/trial-rota-usage"
import { hasPaidWorkspaceAccess } from "@/features/billing/utils/billing-access"
import { getOptionalEnv } from "@/lib/env.server"

type TrialRotaWorkspace = {
  organizationId: string | null
  locationId: string
}

type RotaAccessState = "paid" | "trial" | "recovery"

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

async function getWorkspaceRotaAccessState({
  organizationId,
  locationId,
}: TrialRotaWorkspace): Promise<RotaAccessState> {
  if (!organizationId) {
    const entitlement = await getLocationEntitlement(locationId)

    if (
      entitlement.accessState === "active" ||
      entitlement.accessState === "grace"
    ) {
      return "paid"
    }

    return entitlement.accessState === "trial" ? "trial" : "recovery"
  }

  const billing = await getOrganizationBillingAccess(organizationId)

  if (hasPaidWorkspaceAccess(billing)) {
    return "paid"
  }

  const trial = await ensureWorkspaceTrial({ organizationId })

  return trial.status === "trialing" ? "trial" : "recovery"
}

async function assertTrialRotaCreationAllowed(input: TrialRotaWorkspace) {
  if (isTrialRotaLimitExempt(input)) {
    return
  }

  const accessState = await getWorkspaceRotaAccessState(input)

  if (accessState === "paid") {
    return
  }

  if (accessState === "recovery") {
    throw new Error(
      "This workspace trial has ended. Add billing to create more rotas."
    )
  }

  const rotaCount = await countWorkspaceTrialRotas(input)

  if (rotaCount >= TRIAL_ROTA_LIMIT) {
    throw new Error(
      `Your trial includes up to ${TRIAL_ROTA_LIMIT} rotas. Upgrade to create more.`
    )
  }
}

export { assertTrialRotaCreationAllowed, TRIAL_ROTA_LIMIT }
