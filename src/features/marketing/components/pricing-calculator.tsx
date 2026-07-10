"use client"

import * as React from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
  TIME_ATTENDANCE_EMPLOYEE_PRICE_GBP,
  calculatePricing,
  formatGbp,
  type LocationPricingInput,
} from "@/features/marketing/utils/pricing"

const initialLocation: LocationPricingInput = {
  employeeCount: 10,
  timeAttendanceEnabled: false,
}

function PricingCalculator() {
  const [locations, setLocations] = React.useState<Array<LocationPricingInput>>(
    [initialLocation]
  )
  const pricing = React.useMemo(
    () => calculatePricing({ locations }),
    [locations]
  )

  function updateLocation(
    index: number,
    update: Partial<LocationPricingInput>
  ) {
    setLocations((current) =>
      current.map((location, locationIndex) =>
        locationIndex === index ? { ...location, ...update } : location
      )
    )
  }

  return (
    <div className="rounded-[28px] border border-[#dce7fb] bg-white p-6 shadow-[0_28px_70px_rgba(32,73,146,0.12)] sm:p-7">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-extrabold tracking-[0.18em] text-[#2c69ff] uppercase">
            Pricing calculator
          </p>
          <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-[#18316a]">
            Estimate your monthly price
          </h3>
          <p className="mt-3 text-sm leading-7 text-[#64789e]">
            Locations are included. Your organisation includes 10 used
            employees, then scales by used employee count.
          </p>
        </div>

        <div className="space-y-3">
          {locations.map((location, index) => {
            const breakdown = pricing.locations[index]

            return (
              <div
                key={index}
                className="rounded-[20px] border border-[#dce7fb] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-[#18316a]">
                    Location {index + 1}
                  </p>
                  {locations.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove location ${index + 1}`}
                      onClick={() =>
                        setLocations((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index)
                        )
                      }
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  ) : null}
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#5d739a]">
                      Used employee estimate
                    </span>
                    <span className="font-extrabold text-[#18316a]">
                      {location.employeeCount}
                    </span>
                  </div>
                  <Slider
                    min={1}
                    max={80}
                    step={1}
                    value={[location.employeeCount]}
                    onValueChange={(value) => {
                      const employeeCount = Array.isArray(value)
                        ? (value[0] ?? location.employeeCount)
                        : value
                      updateLocation(index, { employeeCount })
                    }}
                  />
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#f7faff] p-3 text-sm text-[#18316a]">
                    <Checkbox
                      checked={location.timeAttendanceEnabled}
                      onCheckedChange={(checked) =>
                        updateLocation(index, {
                          timeAttendanceEnabled: checked === true,
                        })
                      }
                    />
                    Time & Attendance (+
                    {formatGbp(TIME_ATTENDANCE_EMPLOYEE_PRICE_GBP)} per
                    employee)
                  </label>
                  <p className="text-xs text-[#64789e]">
                    {breakdown?.timeAttendanceEmployees ?? 0} Time &
                    Attendance employee
                    {breakdown?.timeAttendanceEmployees === 1 ? "" : "s"} at{" "}
                    {formatGbp(TIME_ATTENDANCE_EMPLOYEE_PRICE_GBP)} each
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl"
          onClick={() =>
            setLocations((current) => [...current, { ...initialLocation }])
          }
        >
          <PlusIcon className="size-4" />
          Add location
        </Button>

        <div className="grid gap-3 rounded-[24px] bg-[#f7faff] p-5 text-[#18316a] sm:grid-cols-3">
          <SummaryItem label="Base plan" value={formatGbp(pricing.basePrice)} />
          <SummaryItem
            label={`Overage (${pricing.extraEmployees})`}
            value={formatGbp(pricing.extraPrice)}
          />
          <SummaryItem
            label="Time & Attendance"
            value={formatGbp(pricing.timeAttendancePrice)}
          />
        </div>

        <div className="rounded-[24px] border border-[#d8e5fd] bg-[#eef5ff] p-5">
          <p className="text-sm font-semibold text-[#5d739a]">
            Estimated monthly total
          </p>
          <p className="mt-2 text-5xl font-extrabold tracking-tight text-[#18316a]">
            {formatGbp(pricing.totalPrice)}
          </p>
          <p className="mt-2 text-xs text-[#64789e]">
            Excluding VAT. VAT is added where applicable.
          </p>
        </div>
      </div>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-white px-4 py-4 shadow-[0_10px_30px_rgba(31,63,130,0.05)]">
      <p className="text-xs font-semibold tracking-[0.14em] text-[#8aa0c6] uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#18316a]">
        {value}
      </p>
    </div>
  )
}

export { PricingCalculator }
