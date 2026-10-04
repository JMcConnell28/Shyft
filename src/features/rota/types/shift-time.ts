type ShiftTimePeriod = "AM" | "PM"

type ShiftTimeParts = {
  hour: string
  minute: string
  period: ShiftTimePeriod
}

export type { ShiftTimeParts, ShiftTimePeriod }
