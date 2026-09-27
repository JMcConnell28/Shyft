const DEFAULT_CLOCK_TIME_ZONE = "Europe/London"
const formatterCache = new Map<string, Intl.DateTimeFormat>()

type ZonedDateTimeParts = {
  day: number
  hour: number
  minute: number
  month: number
  second: number
  year: number
}

function combineDateAndTimeInTimeZone(
  dateValue: string,
  timeValue: string,
  timeZone: string = DEFAULT_CLOCK_TIME_ZONE
) {
  const [year = 0, month = 1, day = 1] = dateValue.split("-").map(Number)
  const [hour = 0, minute = 0, second = 0] = timeValue.split(":").map(Number)
  const localTimestamp = Date.UTC(year, month - 1, day, hour, minute, second)
  const offsets = [-36, -12, 0, 12, 36].map((hours) =>
    getTimeZoneOffset(
      new Date(localTimestamp + hours * 60 * 60 * 1000),
      timeZone
    )
  )
  const candidates = Array.from(new Set(offsets)).map(
    (offset) => new Date(localTimestamp - offset)
  )
  const exactMatches = candidates.filter(
    (candidate) =>
      getLocalTimestamp(getZonedDateTimeParts(candidate, timeZone)) ===
      localTimestamp
  )

  if (exactMatches.length > 0) {
    return exactMatches.sort(
      (left, right) => left.getTime() - right.getTime()
    )[0]
  }

  const afterGap = candidates
    .map((candidate) => ({
      candidate,
      localTimestamp: getLocalTimestamp(
        getZonedDateTimeParts(candidate, timeZone)
      ),
    }))
    .filter((candidate) => candidate.localTimestamp > localTimestamp)
    .sort((left, right) => left.localTimestamp - right.localTimestamp)

  return afterGap[0]?.candidate ?? candidates[0] ?? new Date(localTimestamp)
}

function getDateKeyInTimeZone(value: string | Date, timeZone: string) {
  const date = typeof value === "string" ? new Date(value) : value
  const parts = getZonedDateTimeParts(date, timeZone)

  return `${parts.year.toString().padStart(4, "0")}-${parts.month
    .toString()
    .padStart(2, "0")}-${parts.day.toString().padStart(2, "0")}`
}

function getTimeInTimeZone(value: Date, timeZone: string) {
  const parts = getZonedDateTimeParts(value, timeZone)

  return `${parts.hour.toString().padStart(2, "0")}:${parts.minute
    .toString()
    .padStart(2, "0")}`
}

function getTimeZoneOffset(value: Date, timeZone: string) {
  return (
    getLocalTimestamp(getZonedDateTimeParts(value, timeZone)) - value.getTime()
  )
}

function getLocalTimestamp(parts: ZonedDateTimeParts) {
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  )
}

function getZonedDateTimeParts(
  value: Date,
  timeZone: string
): ZonedDateTimeParts {
  const parts = new Map(
    getFormatter(timeZone)
      .formatToParts(value)
      .map((part) => [part.type, part.value])
  )

  return {
    day: Number(parts.get("day")),
    hour: Number(parts.get("hour")) % 24,
    minute: Number(parts.get("minute")),
    month: Number(parts.get("month")),
    second: Number(parts.get("second")),
    year: Number(parts.get("year")),
  }
}

function getFormatter(timeZone: string) {
  const cached = formatterCache.get(timeZone)

  if (cached) {
    return cached
  }

  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    year: "numeric",
  })

  formatterCache.set(timeZone, formatter)
  return formatter
}

export {
  combineDateAndTimeInTimeZone,
  DEFAULT_CLOCK_TIME_ZONE,
  getDateKeyInTimeZone,
  getTimeInTimeZone,
}
