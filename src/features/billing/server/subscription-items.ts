import "@tanstack/react-start/server-only"

import {
  getCoreBasePriceId,
  getCoreExtraEmployeePriceId,
  getTimeAttendanceEmployeePriceId,
} from "@/features/billing/server/stripe"
import { validateSubscriptionPrices } from "@/features/billing/server/subscription-prices"

type BillingSubscriptionPriceItem = {
  price: string
  quantity?: number
}

async function buildSubscriptionPriceItems(): Promise<
  Array<BillingSubscriptionPriceItem>
> {
  await validateSubscriptionPrices()
  return [
    { price: getCoreBasePriceId(), quantity: 1 },
    { price: getCoreExtraEmployeePriceId() },
    { price: getTimeAttendanceEmployeePriceId() },
  ]
}

export {
  buildSubscriptionPriceItems as buildSubscriptionItems,
  buildSubscriptionPriceItems as buildSubscriptionLineItems,
}
