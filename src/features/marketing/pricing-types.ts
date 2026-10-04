type LocationPricingInput = {
  employeeCount: number
  timeAttendanceEnabled: boolean
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

export type { LocationPricingInput, PricingBreakdown }
