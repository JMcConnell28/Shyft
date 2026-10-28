import { PlusIcon } from "lucide-react"

import { usePricingEstimate } from "../hooks/use-pricing-estimate"
import { PricingLocation } from "./pricing-location"
import { PricingSummary } from "./pricing-summary"

function PricingCalculator() {
  const { locations, pricing, addLocation, removeLocation, updateLocation } =
    usePricingEstimate()
  return (
    <section
      id="calculator"
      className="pricing-estimator preview-container"
      aria-labelledby="pricing-calculator-title"
    >
      <div className="pricing-section-intro">
        <p className="marketing-eyebrow">Make it your own</p>
        <h2 id="pricing-calculator-title">
          Your team. <em>Your estimate.</em>
        </h2>
        <p>
          Adjust the people and locations in your organisation. See exactly how
          your monthly price comes together.
        </p>
      </div>
      <div className="pricing-calculator-grid">
        <div className="pricing-location-list">
          {locations.map((location, index) => (
            <PricingLocation
              key={location.id}
              location={location}
              number={index + 1}
              canRemove={locations.length > 1}
              attendanceEmployees={
                pricing.locations[index].timeAttendanceEmployees
              }
              onUpdate={(update) => updateLocation(location.id, update)}
              onRemove={() => removeLocation(location.id)}
            />
          ))}
          <button
            type="button"
            className="pricing-add-location"
            onClick={addLocation}
          >
            <PlusIcon size={16} aria-hidden="true" />
            Add location
          </button>
        </div>
        <PricingSummary pricing={pricing} />
      </div>
    </section>
  )
}

export { PricingCalculator }
