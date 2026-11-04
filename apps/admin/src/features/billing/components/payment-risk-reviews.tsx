import type { PaymentRisk } from "@/features/billing/schemas/payment-risk-schemas"
import { Button } from "@/components/ui/button"
import { usePaymentRiskReview } from "@/features/billing/hooks/use-payment-risk-review"

function PaymentRiskRow({ risk }: { risk: PaymentRisk }) {
  const review = usePaymentRiskReview()
  const label =
    risk.kind === "refund"
      ? risk.amountRefunded < risk.amount
        ? "Partial refund"
        : "Full refund"
      : risk.kind === "dispute"
        ? "Dispute"
        : "Early fraud warning"
  const url = `https://dashboard.stripe.com/${risk.livemode ? "" : "test/"}payments/${encodeURIComponent(risk.paymentIntentId ?? risk.chargeId)}`
  return (
    <li className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="font-medium">
        {label} —{" "}
        <a className="underline" href={url} target="_blank" rel="noreferrer">
          Review payment in Stripe
        </a>
      </p>
      <p className="text-sm break-all text-slate-600">
        {risk.subscriptionId ??
          "Subscription not linked; check the payment before resolving."}
      </p>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          review.mutate({
            riskId: risk.id,
            reason: String(data.get("reason") ?? ""),
          })
        }}
      >
        <label className="min-w-48 flex-1 text-sm">
          Review outcome
          <input
            name="reason"
            minLength={10}
            maxLength={1000}
            required
            placeholder="Actions taken and why dispatch can resume"
            className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3"
          />
        </label>
        <Button className="self-end" type="submit" disabled={review.isPending}>
          {review.isPending ? "Saving..." : "Mark reviewed"}
        </Button>
      </form>
      {review.isError ? (
        <p role="alert" className="text-sm text-red-600">
          Could not save the review. Try again.
        </p>
      ) : null}
    </li>
  )
}

function PaymentRiskReviews({ risks }: { risks: Array<PaymentRisk> }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Payment reviews</h2>
      <p className="text-sm text-slate-600">
        Review refunds, disputes and fraud warnings before dispatching hardware.
        Check Stripe and decide whether subscription access should change there.
        Partial refunds do not automatically cancel access.
      </p>
      {risks.length ? (
        <ul className="space-y-3">
          {risks.map((risk) => (
            <PaymentRiskRow key={risk.id} risk={risk} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">
          No payment reviews are waiting.
        </p>
      )}
    </section>
  )
}

export { PaymentRiskReviews }
