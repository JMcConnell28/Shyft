type CustomerStage =
  | "onboarding"
  | "trial"
  | "trial_expired"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "paused"
  | "incomplete_expired"

type CustomerSummary = {
  id: string
  name: string
  email: string | null
  stage: CustomerStage
  createdAt: string
  trialEndsAt: string | null
  locationCount: number
  addonCount: number
  stationsNeeded: number
}

type CustomerLocation = {
  id: string
  name: string
  trialEndsAt: string | null
  billingStatus: string | null
  addonStatus: string | null
  fulfillmentStatus: string | null
  paymentConfirmedAt: string | null
  invoiceId: string | null
  needsStation: boolean
  deliveryAddress: Array<string>
  reference: string | null
  notes: string | null
  shippedAt: string | null
  requests: Array<StationRequest>
}

type StationRequest = Omit<
  CustomerLocation,
  | "requests"
  | "name"
  | "trialEndsAt"
  | "billingStatus"
  | "addonStatus"
  | "invoiceId"
> & {
  locationId: string
  source: "included" | "additional"
  clockTagId: string | null
  paymentStatus: string
  isLive: boolean
}

type CustomerDetail = {
  customer: CustomerSummary
  locations: Array<CustomerLocation>
}
type CustomerListData = { customers: Array<CustomerSummary>; total: number }
type StationQueueItem = {
  requestId: string
  source: "included" | "additional"
  customerId: string
  customerName: string
  locationId: string
  locationName: string
  hasTag: boolean
  paidAt: string
}

export type {
  StationRequest,
  CustomerStage,
  CustomerSummary,
  CustomerLocation,
  CustomerDetail,
  CustomerListData,
  StationQueueItem,
}
