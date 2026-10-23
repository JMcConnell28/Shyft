import { useState } from "react"
import { useStationPurchase } from "../hooks/use-station-purchase"
import { Button } from "@/components/ui/button"
import {
  TimeAttendanceAddressFields,
  emptyTimeAttendanceAddress,
  toTimeAttendanceDeliveryAddress,
} from "@/features/billing/components/time-attendance-address-fields"

function StationPurchaseSection({
  locationId,
  locationName,
}: {
  locationId: string
  locationName: string
}) {
  const { options, checkout } = useStationPurchase(locationId)
  const [expanded, setExpanded] = useState(false)
  const [address, setAddress] = useState(emptyTimeAttendanceAddress)
  const data = options.data
  const price =
    data?.unitAmount != null
      ? new Intl.NumberFormat("en-GB", {
          style: "currency",
          currency: data.currency,
        }).format(data.unitAmount / 100)
      : null
  return (
    <section className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">
            Clock-in stations · {locationName}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            One station is included per location with Time & Attendance. Extra
            stations are a one-off hardware purchase with no extra monthly
            station fee.
          </p>
        </div>
        {data?.canPurchase && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Close" : `Buy extra station · ${price}`}
          </Button>
        )}
      </div>
      {options.isPending && (
        <p role="status" className="text-xs text-muted-foreground">
          Loading station orders…
        </p>
      )}
      {options.isError && (
        <p role="alert" className="text-sm text-destructive">
          Could not load station orders.{" "}
          <button className="underline" onClick={() => options.refetch()}>
            Try again
          </button>
        </p>
      )}
      {data?.reason && (
        <p className="text-xs text-muted-foreground">{data.reason}</p>
      )}
      {expanded && data?.canPurchase && (
        <form
          className="max-w-lg space-y-4 border-t pt-4"
          onSubmit={(event) => {
            event.preventDefault()
            checkout.mutate(toTimeAttendanceDeliveryAddress(address))
          }}
        >
          <TimeAttendanceAddressFields
            idPrefix={`station-${locationId}`}
            value={address}
            onChange={setAddress}
            mode="location"
          />
          <p className="text-xs text-muted-foreground">
            One additional station: {price}. Check the total in Stripe before
            paying. Delivery is currently available to BT47 and BT48 postcodes.
          </p>
          <Button size="sm" type="submit" disabled={checkout.isPending}>
            {checkout.isPending ? "Opening checkout…" : "Continue to payment"}
          </Button>
          {checkout.isError && (
            <p role="alert" className="text-sm text-destructive">
              {checkout.error.message}
            </p>
          )}
        </form>
      )}
      {data && data.purchases.length > 0 && (
        <ul className="divide-y border-t text-xs">
          {data.purchases.map((purchase) => (
            <li
              key={purchase.id}
              className="flex flex-wrap justify-between gap-2 py-2"
            >
              <span>
                Extra station ·{" "}
                {new Date(purchase.createdAt).toLocaleDateString("en-GB")}
              </span>
              <span>
                {purchase.paymentStatus === "paid"
                  ? `${purchase.isLive ? "Paid" : "Test payment"} · ${purchase.fulfillmentStatus}`
                  : purchase.paymentStatus.replaceAll("_", " ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
export { StationPurchaseSection }
