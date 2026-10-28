import { MapPinIcon, Trash2Icon } from "lucide-react"

import type {
  LocationPricingInput,
  PricingCalculatorLocation,
} from "../pricing-types"
import {
  INCLUDED_CORE_EMPLOYEES,
  TIME_ATTENDANCE_EMPLOYEE_PRICE_GBP,
  formatGbp,
} from "../utils/pricing"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

type PricingLocationProps = {
  location: PricingCalculatorLocation
  number: number
  canRemove: boolean
  attendanceEmployees: number
  onUpdate: (update: Partial<LocationPricingInput>) => void
  onRemove: () => void
}

export function PricingLocation({
  location,
  number,
  canRemove,
  attendanceEmployees,
  onUpdate,
  onRemove,
}: PricingLocationProps) {
  const labelId = `pricing-location-${location.id}-employees`
  return (
    <section
      className="pricing-location"
      aria-labelledby={`pricing-location-${location.id}`}
    >
      <div className="pricing-location-heading">
        <h3 id={`pricing-location-${location.id}`}>
          <MapPinIcon size={16} aria-hidden="true" />
          Location {number}
        </h3>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove location ${number}`}
            onClick={onRemove}
          >
            <Trash2Icon size={15} />
          </Button>
        )}
      </div>
      <div className="pricing-employee-label">
        <span id={labelId}>
          Used employees <span className="sr-only">at location {number}</span>
        </span>
        <output>{location.employeeCount}</output>
      </div>
      <Slider
        aria-labelledby={labelId}
        min={1}
        max={80}
        step={1}
        value={[location.employeeCount]}
        onValueChange={(value) =>
          onUpdate({
            employeeCount: Array.isArray(value)
              ? (value[0] ?? location.employeeCount)
              : value,
          })
        }
      />
      <div className="pricing-slider-range" aria-hidden="true">
        <span>1 employee</span>
        <span>80 employees</span>
      </div>
      <label className="pricing-attendance-toggle">
        <Checkbox
          checked={location.timeAttendanceEnabled}
          onCheckedChange={(checked) =>
            onUpdate({ timeAttendanceEnabled: checked === true })
          }
        />
        <span>
          <strong>Add Time & Attendance</strong>
          <small>
            First {INCLUDED_CORE_EMPLOYEES} included here, then{" "}
            {formatGbp(TIME_ATTENDANCE_EMPLOYEE_PRICE_GBP)} per extra employee.
          </small>
        </span>
      </label>
      {location.timeAttendanceEnabled && (
        <p className="pricing-location-note">
          {attendanceEmployees === 0
            ? "Clocking is included for this location's team."
            : `${attendanceEmployees} extra clocking ${attendanceEmployees === 1 ? "employee" : "employees"} at ${formatGbp(TIME_ATTENDANCE_EMPLOYEE_PRICE_GBP)} each per month.`}
        </p>
      )}
    </section>
  )
}
