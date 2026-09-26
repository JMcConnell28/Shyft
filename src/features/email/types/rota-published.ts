type RotaPublishedShift = {
  dayDate: string
  durationMinutes: number
  timeLabel: string
  zoneName: string | null
}

type RotaPublishedRecipient = {
  email: string
  locationName: string
  shifts: Array<RotaPublishedShift>
  shiftSwapsEnabled: boolean
  weekStart: string
}

type PublishedShiftDetails = {
  estimated_closing_time: string
  estimated_closing_time_next_day: boolean
  location_close_time: string | null
  location_close_time_next_day: boolean | null
  shift_day_date: string
  shift_end_kind: "location_close" | null
  shift_end_time: string | null
  shift_split_second_end_time: string | null
  shift_split_second_start_time: string | null
  shift_start_time: string
  shift_type: "standard" | "closing" | "split"
  zone_name: string | null
}

export type {
  PublishedShiftDetails,
  RotaPublishedRecipient,
  RotaPublishedShift,
}
