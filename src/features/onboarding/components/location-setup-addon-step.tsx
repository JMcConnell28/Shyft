import { Clock3Icon } from "lucide-react"
import type * as React from "react"

import { Switch } from "@/components/ui/switch"
import { TimeAttendanceAddressFields } from "@/features/billing/components/time-attendance-address-fields"
import { StepIntro } from "@/features/onboarding/components/setup-step-intro"
import { cn } from "@/lib/utils"

type AddressValue = React.ComponentProps<
  typeof TimeAttendanceAddressFields
>["value"]

function AddonStep({
  address,
  enabled,
  onAddressChange,
  onEnabledChange,
}: {
  address: AddressValue
  enabled: boolean
  onAddressChange: (value: AddressValue) => void
  onEnabledChange: (value: boolean) => void
}) {
  return (
    <section>
      <StepIntro
        title="Choose your add-ons"
        description="Add Time & Attendance now, or turn it on later from settings."
      />
      <div className="mx-auto max-w-[540px] space-y-3">
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border p-2.5 transition-[border-color,background-color]",
            enabled ? "border-[#1264e9] bg-[#f7fbff]" : "border-[#dce5f4]"
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#e8f2ff] text-[#1264e9]">
            <Clock3Icon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-[#152750] sm:text-base">
              Time & Attendance
            </h2>
            <p className="mt-0.5 text-xs leading-4 text-[#56698d]">
              Track clock-ins and timesheets for your team.
            </p>
            <p className="mt-1 text-xs font-semibold text-[#1264e9]">
              See current price in billing
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            aria-label="Enable Time and Attendance"
            className="shrink-0"
          />
        </div>
        {enabled ? (
          <div className="space-y-2 rounded-xl border border-[#dce5f4] bg-white p-2.5">
            <div>
              <h3 className="text-sm font-bold text-[#152750]">
                Your location address
              </h3>
              <p className="mt-0.5 text-xs leading-4 text-[#627391]">
                Saved for this location and station delivery in selected UK
                postcodes.
              </p>
            </div>
            <TimeAttendanceAddressFields
              idPrefix="onboarding-location"
              value={address}
              onChange={onAddressChange}
              mode="location"
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}

export { AddonStep }
