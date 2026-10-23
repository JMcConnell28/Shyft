type StationPurchase = {
  id: string
  paymentStatus: string
  fulfillmentStatus: string
  createdAt: string
  amount: number
  currency: string
  isLive: boolean
}
type StationPurchaseOptions = {
  canPurchase: boolean
  reason: string | null
  unitAmount: number | null
  currency: string
  purchases: Array<StationPurchase>
}
export type { StationPurchase, StationPurchaseOptions }
