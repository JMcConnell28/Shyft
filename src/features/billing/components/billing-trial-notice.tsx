import { CalendarClockIcon } from "lucide-react"

import type {
  WorkspaceBillingState,
  WorkspaceTrial,
} from "@/features/billing/types"
import { formatBillingDate } from "@/features/billing/utils/billing-settings"
import { getTrialDisplayState } from "@/features/billing/utils/trial-state"
import { cn } from "@/lib/utils"

function BillingTrialNotice({
  billing,
  trial,
}: {
  billing: WorkspaceBillingState | null
  trial: WorkspaceTrial | null
}) {
  const trialState = getTrialDisplayState(trial)

  if (!trialState || billing?.hasActiveSubscription) return null

  const hasCard = Boolean(billing?.hasSavedPaymentMethod)
  const isUrgent = trialState.isExpired || trialState.isEndingSoon
  const title = hasCard
    ? "Payment method saved"
    : trialState.isExpired
      ? "Trial ended"
      : trialState.isEndingSoon
        ? "Trial ending soon"
        : "Trial active"
  const description = hasCard
    ? "No payment has been taken. The saved payment method will be used when the trial ends."
    : trialState.isExpired
      ? "Choose a plan to restore paid rota access for this workspace."
      : `This workspace has ${trialState.daysRemaining} day${trialState.daysRemaining === 1 ? "" : "s"} remaining. Add a payment method before ${formatBillingDate(trialState.trialEndsAt)} to avoid interruption.`

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-[0_3px_12px_rgba(31,51,91,0.035)]",
        isUrgent ? "border-amber-200" : "border-[#dce3ef]"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
          isUrgent ? "bg-amber-50 text-amber-700" : "bg-[#eef3ff] text-blue-600"
        )}
      >
        <CalendarClockIcon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-[#14214a]">{title}</p>
        <p className="mt-0.5 text-[11px] leading-[1.1rem] font-medium text-[#7180a2]">
          {description}
        </p>
      </div>
    </div>
  )
}

export { BillingTrialNotice }
