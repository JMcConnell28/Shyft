const DEFAULT_MINIMUM_WAGE_PENCE = 1271

const currentMinimumWageBands = [
  {
    minimumAge: 21,
    hourlyRatePence: 1271,
  },
  {
    minimumAge: 18,
    hourlyRatePence: 1085,
  },
  {
    minimumAge: 0,
    hourlyRatePence: 800,
  },
] as const

function getAgeOnDate(dateOfBirth: string, onDate = new Date()) {
  const birthDate = parseIsoDate(dateOfBirth)

  if (!birthDate) {
    return null
  }

  const birthdayThisYear = new Date(
    Date.UTC(
      onDate.getUTCFullYear(),
      birthDate.getUTCMonth(),
      birthDate.getUTCDate()
    )
  )

  return (
    onDate.getUTCFullYear() -
    birthDate.getUTCFullYear() -
    (onDate < birthdayThisYear ? 1 : 0)
  )
}

function getMinimumWagePenceForDateOfBirth(
  dateOfBirth: string | null | undefined,
  onDate = new Date()
) {
  if (!dateOfBirth) {
    return DEFAULT_MINIMUM_WAGE_PENCE
  }

  const age = getAgeOnDate(dateOfBirth, onDate)

  if (age === null) {
    return DEFAULT_MINIMUM_WAGE_PENCE
  }

  return (
    currentMinimumWageBands.find((band) => age >= band.minimumAge)
      ?.hourlyRatePence ?? DEFAULT_MINIMUM_WAGE_PENCE
  )
}

function parseIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null
  }

  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

export {
  DEFAULT_MINIMUM_WAGE_PENCE,
  getAgeOnDate,
  getMinimumWagePenceForDateOfBirth,
}
