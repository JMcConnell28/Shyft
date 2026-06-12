"use client"

import * as React from "react"

import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import {
  EXTRA_EMPLOYEE_PRICE_GBP,
  calculatePricing,
  formatGbp,
} from "@/features/marketing/utils/pricing"

function PricingCalculator() {
  const [locationCount, setLocationCount] = React.useState(1)
  const [employeeCount, setEmployeeCount] = React.useState(10)

  const pricing = React.useMemo(
    () => calculatePricing({ employeeCount, locationCount }),
    [employeeCount, locationCount],
  )

  return (
    <div className="rounded-[28px] border border-[#dce7fb] bg-white p-6 shadow-[0_28px_70px_rgba(32,73,146,0.12)] sm:p-7">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#2c69ff]">
            Pricing calculator
          </p>
          <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-[#18316a]">
            See your monthly price in seconds
          </h3>
          <p className="mt-3 text-sm leading-7 text-[#64789e]">
            Each location includes 10 employees. After that, extra team members are
            just {formatGbp(EXTRA_EMPLOYEE_PRICE_GBP)} each per month.
          </p>
        </div>

        <SliderField
          label="Locations"
          value={locationCount}
          min={1}
          max={12}
          onValueChange={setLocationCount}
        />

        <SliderField
          label="Employees"
          value={employeeCount}
          min={1}
          max={120}
          onValueChange={setEmployeeCount}
        />

        <div className="grid gap-3 rounded-[24px] bg-[#f7faff] p-5 text-[#18316a] sm:grid-cols-3">
          <SummaryItem label="Base plan" value={formatGbp(pricing.basePrice)} />
          <SummaryItem
            label={`Included staff (${pricing.includedEmployees})`}
            value={formatGbp(0)}
          />
          <SummaryItem
            label={`Extra staff (${pricing.extraEmployees})`}
            value={formatGbp(pricing.extraPrice)}
          />
        </div>

        <div className="rounded-[24px] border border-[#d8e5fd] bg-[#eef5ff] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#5d739a]">
                Estimated monthly total
              </p>
              <p className="mt-2 text-5xl font-extrabold tracking-tight text-[#18316a]">
                {formatGbp(pricing.totalPrice)}
              </p>
            </div>
            <p className="max-w-[260px] text-sm leading-7 text-[#5d739a]">
              {pricing.locationCount} location{pricing.locationCount === 1 ? "" : "s"} and{" "}
              {pricing.employeeCount} employee{pricing.employeeCount === 1 ? "" : "s"}.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SliderField({
  label,
  min,
  max,
  value,
  onValueChange,
}: {
  label: string
  min: number
  max: number
  value: number
  onValueChange: (value: number) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#18316a]">{label}</p>
          <p className="text-xs text-[#6b7fa3]">
            Choose a number between {min} and {max}
          </p>
        </div>
        <div className="rounded-2xl border border-[#d9e4fb] bg-[#fbfdff] px-4 py-2 text-lg font-extrabold text-[#18316a]">
          {value}
        </div>
      </div>

      <Slider
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={(nextValue) =>
          onValueChange(
            Array.isArray(nextValue) ? (nextValue[0] ?? value) : nextValue,
          )
        }
        className={cn("[&_[data-slot=slider-thumb]]:size-5")}
      />

      <div className="flex justify-between text-xs font-medium text-[#8a9fc5]">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

function SummaryItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-[18px] bg-white px-4 py-4 shadow-[0_10px_30px_rgba(31,63,130,0.05)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8aa0c6]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#18316a]">
        {value}
      </p>
    </div>
  )
}

export { PricingCalculator }
