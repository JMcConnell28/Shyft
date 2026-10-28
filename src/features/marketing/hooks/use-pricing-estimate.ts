import { useRef, useState } from "react"

import type {
  LocationPricingInput,
  PricingCalculatorLocation,
  PricingEstimate,
} from "../pricing-types"
import { calculatePricing } from "../utils/pricing"

const defaultLocation: LocationPricingInput = {
  employeeCount: 10,
  timeAttendanceEnabled: false,
}

export function usePricingEstimate(): PricingEstimate {
  const [locations, setLocations] = useState<Array<PricingCalculatorLocation>>([
    { id: 1, ...defaultLocation },
  ])
  const nextId = useRef(2)

  function addLocation() {
    const id = nextId.current++
    setLocations((current) => [...current, { id, ...defaultLocation }])
  }

  function removeLocation(id: number) {
    setLocations((current) =>
      current.length > 1
        ? current.filter((location) => location.id !== id)
        : current
    )
  }

  function updateLocation(id: number, update: Partial<LocationPricingInput>) {
    setLocations((current) =>
      current.map((location) =>
        location.id === id ? { ...location, ...update } : location
      )
    )
  }

  return {
    locations,
    pricing: calculatePricing({ locations }),
    addLocation,
    removeLocation,
    updateLocation,
  }
}
