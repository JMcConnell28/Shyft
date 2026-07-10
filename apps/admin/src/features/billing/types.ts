type BillingLocation = {
  billingStatus: string | null
  locationId: string
  locationName: string
  organizationName: string | null
  trialEndsAt: string
}

type BillingPageData = {
  locations: BillingLocation[]
}

export type { BillingLocation, BillingPageData }
