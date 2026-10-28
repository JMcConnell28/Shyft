type LocationPricingInput = {
  employeeCount: number
  timeAttendanceEnabled: boolean
}

type PricingCalculatorLocation = LocationPricingInput & { id: number }

type PricingEstimate = {
  locations: Array<PricingCalculatorLocation>
  pricing: PricingBreakdown
  addLocation: () => void
  removeLocation: (id: number) => void
  updateLocation: (id: number, update: Partial<LocationPricingInput>) => void
}

type LocationPricingBreakdown = LocationPricingInput & {
  extraEmployees: number
  timeAttendanceEmployees: number
}

type PricingBreakdown = {
  locationCount: number
  employeeCount: number
  includedEmployees: number
  extraEmployees: number
  basePrice: number
  extraPrice: number
  timeAttendancePrice: number
  totalPrice: number
  locations: Array<LocationPricingBreakdown>
}

export type {
  LocationPricingInput,
  PricingBreakdown,
  PricingCalculatorLocation,
  PricingEstimate,
}
