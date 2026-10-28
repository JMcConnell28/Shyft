import { CheckIcon } from "lucide-react"

export function MarketingTrialNotes() {
  return (
    <ul className="marketing-trial-notes" aria-label="Free trial details">
      {["14-day free trial", "No credit card required", "Cancel anytime"].map(
        (item) => (
          <li key={item}>
            <CheckIcon size={14} aria-hidden="true" />
            {item}
          </li>
        )
      )}
    </ul>
  )
}
