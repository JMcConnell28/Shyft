type PricingBreakdown = {
  locationCount: number
  employeeCount: number
  includedEmployees: number
  extraEmployees: number
  basePrice: number
  extraPrice: number
  totalPrice: number
}

const BASE_LOCATION_PRICE_GBP = 30
const INCLUDED_EMPLOYEES_PER_LOCATION = 10
const EXTRA_EMPLOYEE_PRICE_GBP = 2

function calculatePricing(input: {
  employeeCount: number
  locationCount: number
}): PricingBreakdown {
  const locationCount = Math.max(1, Math.floor(input.locationCount))
  const employeeCount = Math.max(0, Math.floor(input.employeeCount))
  const includedEmployees = locationCount * INCLUDED_EMPLOYEES_PER_LOCATION
  const extraEmployees = Math.max(0, employeeCount - includedEmployees)
  const basePrice = locationCount * BASE_LOCATION_PRICE_GBP
  const extraPrice = extraEmployees * EXTRA_EMPLOYEE_PRICE_GBP

  return {
    locationCount,
    employeeCount,
    includedEmployees,
    extraEmployees,
    basePrice,
    extraPrice,
    totalPrice: basePrice + extraPrice,
  }
}

function formatGbp(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value)
}

export {
  BASE_LOCATION_PRICE_GBP,
  EXTRA_EMPLOYEE_PRICE_GBP,
  INCLUDED_EMPLOYEES_PER_LOCATION,
  calculatePricing,
  formatGbp,
}
export type { PricingBreakdown }
