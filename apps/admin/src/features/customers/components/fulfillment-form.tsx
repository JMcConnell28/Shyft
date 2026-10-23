import { useState } from "react"
import { fulfillmentLabels } from "../constants"
import { useUpdateFulfillment } from "../hooks/use-customers"
import { updateFulfillmentSchema } from "../schemas"
import type { StationRequest } from "../types"
import { Button } from "@/components/ui/button"

function FulfillmentForm({ location }: { location: StationRequest }) {
  const [reference, setReference] = useState(location.reference ?? "")
  const [notes, setNotes] = useState(location.notes ?? "")
  const mutation = useUpdateFulfillment()
  const status = location.fulfillmentStatus
  const actions =
    status === "pending" || status === "failed"
      ? (["ready"] as const)
      : status === "ready"
        ? (["pending", "shipped"] as const)
        : status === "shipped"
          ? (["delivered", "failed"] as const)
          : []
  if (!status || status === "not_requested") return null
  function save(next: string) {
    const data = updateFulfillmentSchema.parse({
      requestId: location.id,
      expectedStatus: status,
      status: next,
      reference,
      notes,
    })
    mutation.mutate(data)
  }
  return (
    <div className="space-y-3 border-t border-slate-200 pt-4">
      <p className="text-sm font-semibold">Internal fulfilment</p>
      <label className="block text-sm">
        Shipping reference
        <input
          className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3"
          value={reference}
          maxLength={200}
          onChange={(event) => setReference(event.target.value)}
        />
      </label>
      <label className="block text-sm">
        Internal notes
        <textarea
          className="mt-1 min-h-20 w-full rounded-md border border-slate-200 p-3"
          value={notes}
          maxLength={2000}
          onChange={(event) => setNotes(event.target.value)}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          disabled={mutation.isPending}
          onClick={() => save(status)}
        >
          Save details
        </Button>
        {actions.map((action) => (
          <Button
            key={action}
            disabled={
              mutation.isPending ||
              (["ready", "shipped"].includes(action) && !location.needsStation)
            }
            onClick={() => save(action)}
          >
            {action === "ready"
              ? "Mark ready to send"
              : action === "shipped"
                ? "Mark sent"
                : action === "delivered"
                  ? "Mark delivered"
                  : fulfillmentLabels[action]}
          </Button>
        ))}
      </div>
      {mutation.isError && (
        <p role="alert" className="text-sm text-red-700">
          {mutation.error.message}
        </p>
      )}
      {mutation.isSuccess && (
        <p role="status" className="text-sm text-emerald-700">
          Station details updated.
        </p>
      )}
      <p className="text-xs text-slate-500">
        Internal tracking only. No dispatch email is sent to the customer.
      </p>
    </div>
  )
}
export { FulfillmentForm }
