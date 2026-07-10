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

const CORE_BASE_PRICE_GBP = 25
const INCLUDED_CORE_EMPLOYEES = 10
const EXTRA_EMPLOYEE_PRICE_GBP = 2.5
const TIME_ATTENDANCE_EMPLOYEE_PRICE_GBP = 1

function calculatePricing(input: {
  locations: Array<LocationPricingInput>
}): PricingBreakdown {
  const normalizedLocations =
    input.locations.length > 0
      ? input.locations
      : [{ employeeCount: 0, timeAttendanceEnabled: false }]
  const locations = normalizedLocations.map((location) => {
    const employeeCount = Math.max(0, Math.floor(location.employeeCount))

    return {
      employeeCount,
      extraEmployees: 0,
      timeAttendanceEmployees: location.timeAttendanceEnabled
        ? employeeCount
        : 0,
      timeAttendanceEnabled: location.timeAttendanceEnabled,
    }
  })
  const employeeCount = locations.reduce(
    (total, location) => total + location.employeeCount,
    0
  )
  const extraEmployees = Math.max(employeeCount - INCLUDED_CORE_EMPLOYEES, 0)
  const timeAttendanceEmployees = locations.reduce(
    (total, location) => total + location.timeAttendanceEmployees,
    0
  )
  const extraPrice = extraEmployees * EXTRA_EMPLOYEE_PRICE_GBP
  const timeAttendancePrice =
    timeAttendanceEmployees * TIME_ATTENDANCE_EMPLOYEE_PRICE_GBP

  return {
    locationCount: locations.length,
    employeeCount,
    includedEmployees: INCLUDED_CORE_EMPLOYEES,
    extraEmployees,
    basePrice: CORE_BASE_PRICE_GBP,
    extraPrice,
    timeAttendancePrice,
    totalPrice: CORE_BASE_PRICE_GBP + extraPrice + timeAttendancePrice,
    locations,
  }
}

function formatGbp(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)
}

export {
  CORE_BASE_PRICE_GBP,
  EXTRA_EMPLOYEE_PRICE_GBP,
  INCLUDED_CORE_EMPLOYEES,
  TIME_ATTENDANCE_EMPLOYEE_PRICE_GBP,
  calculatePricing,
  formatGbp,
}
export type { LocationPricingInput, PricingBreakdown }
