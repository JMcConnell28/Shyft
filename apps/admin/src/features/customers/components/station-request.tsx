import { useState } from "react"
import { fulfillmentLabels } from "../constants"
import { useSetupStationTag } from "../hooks/use-customers"
import { FulfillmentForm } from "./fulfillment-form"
import type { StationRequest } from "../types"
import type { ClockStationTag } from "@/features/clock-stations/types"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/utils"

function StationRequestCard({
  request,
  canManage,
  tags,
  tagsUnavailable,
}: {
  request: StationRequest
  canManage: boolean
  tags: Array<ClockStationTag>
  tagsUnavailable: boolean
}) {
  const setup = useSetupStationTag()
  const [tagId, setTagId] = useState("")
  const status = request.fulfillmentStatus
  const label =
    status && Object.hasOwn(fulfillmentLabels, status)
      ? fulfillmentLabels[status as keyof typeof fulfillmentLabels]
      : "Not requested"
  return (
    <section className="space-y-4 rounded-md border border-slate-200 p-4">
      <div className="flex flex-wrap justify-between gap-2 text-sm font-semibold">
        <h3>
          {request.source === "included"
            ? "Included station"
            : `Extra station · ${request.id.slice(-8)}`}
        </h3>
        <span>{label}</span>
      </div>
      <p className="text-sm text-slate-600">
        Payment: {request.paymentStatus.replaceAll("_", " ")}
        {request.paymentConfirmedAt
          ? ` · ${formatDateTime(request.paymentConfirmedAt)}`
          : ""}
        {request.source === "additional" && !request.isLive
          ? " · Test/unpaid order"
          : ""}
      </p>
      {request.needsStation ? (
        <p role="status" className="text-sm text-amber-800">
          Payment confirmed. Prepare this station and arrange dispatch.
        </p>
      ) : (
        !["shipped", "delivered"].includes(status ?? "") && (
          <p className="text-xs text-slate-500">
            On hold until payment and the active Time & Attendance subscription
            are confirmed.
          </p>
        )
      )}
      <div className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <h4 className="font-semibold">Delivery address</h4>
          <address className="mt-1 text-slate-600 not-italic">
            {request.deliveryAddress.length
              ? request.deliveryAddress.map((line, i) => (
                  <p key={`${i}-${line}`}>{line}</p>
                ))
              : "Delivery address missing. Resolve before dispatch."}
          </address>
        </div>
        <div>
          <h4 className="font-semibold">Dispatch</h4>
          <p className="mt-1 text-slate-600">
            {request.shippedAt
              ? `Sent ${formatDateTime(request.shippedAt)}`
              : "Not sent yet"}
          </p>
        </div>
      </div>
      {canManage && (
        <>
          {request.clockTagId ? (
            <p className="text-xs text-slate-600">
              Assigned NFC tag: {request.clockTagId}
            </p>
          ) : (
            <div className="space-y-2">
              <Button
                variant="secondary"
                disabled={setup.isPending || tagsUnavailable}
                onClick={() => setup.mutate({ requestId: request.id })}
              >
                {setup.isPending ? "Creating…" : "Create NFC tag"}
              </Button>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <select
                    aria-label="Existing NFC tag"
                    value={tagId}
                    onChange={(e) => setTagId(e.target.value)}
                    className="h-10 max-w-full rounded border border-slate-200 px-2 text-xs"
                  >
                    <option value="">Choose existing tag</option>
                    {tags
                      .filter((tag) => tag.isActive)
                      .map((tag) => (
                        <option key={tag.id} value={tag.id}>
                          {tag.label} ·{" "}
                          {tag.publicId?.slice(-8) ?? tag.id.slice(-8)}
                        </option>
                      ))}
                  </select>
                  <Button
                    variant="secondary"
                    disabled={!tagId || setup.isPending || tagsUnavailable}
                    onClick={() =>
                      setup.mutate({ requestId: request.id, tagId })
                    }
                  >
                    Assign tag
                  </Button>
                </div>
              )}
              {setup.isError && (
                <p role="alert" className="text-sm text-red-700">
                  {setup.error.message}
                </p>
              )}
            </div>
          )}
          <FulfillmentForm location={request} />
        </>
      )}
    </section>
  )
}
export { StationRequestCard }
