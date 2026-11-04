import type { PaymentRisk } from "@/features/billing/schemas/payment-risk-schemas"
import type { BillingReconciliationHealth } from "@rocketrota/db/billing-reconciliation"

type BillingLocation = {
  billingStatus: string | null
  locationId: string
  locationName: string
  organizationName: string | null
  trialEndsAt: string
}

type BillingPageData = {
  locations: Array<BillingLocation>
  risks: Array<PaymentRisk>
  reconciliation: BillingReconciliationHealth
}

export type { BillingLocation, BillingPageData }
