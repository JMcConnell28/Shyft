import { useRef } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { getStationPurchaseOptions, startStationPurchase } from "../server-fns"
import { startStationPurchaseSchema } from "../schemas"
import type { TimeAttendanceDeliveryAddress } from "@/features/billing/schemas/time-attendance-addon-schemas"

function useStationPurchase(locationId: string) {
  const purchaseId = useRef<string | null>(null)
  const options = useQuery({
    queryKey: ["station-purchases", locationId],
    queryFn: () => getStationPurchaseOptions({ data: { locationId } }),
    refetchInterval: 60000,
  })
  const checkout = useMutation({
    mutationFn: async (deliveryAddress: TimeAttendanceDeliveryAddress) => {
      purchaseId.current ??= crypto.randomUUID()
      const data = startStationPurchaseSchema.parse({
        locationId,
        purchaseId: purchaseId.current,
        deliveryAddress,
        returnPath: window.location.pathname,
      })
      return startStationPurchase({ data })
    },
    onSuccess: ({ checkoutUrl }) => window.location.assign(checkoutUrl),
  })
  return { options, checkout }
}
export { useStationPurchase }
