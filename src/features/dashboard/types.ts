type DashboardShiftSummary = {
  id: string
  dateLabel: string
  dayLabel: string
  locationName: string
  locationSlug: string
  rotaId: string
  timeLabel: string
  zoneName: string
}

type DashboardShiftOverview = {
  clockStatus: DashboardClockStatus
  nextShift: DashboardShiftSummary | null
  thisWeekShifts: DashboardShiftSummary[]
  weekRangeLabel: string
}

type DashboardClockStatus = {
  completedTodayMs: number
  todayEntryCount: number
  openEntry: {
    id: string
    clockedInAt: string
    locationName: string
    source: "employee_nfc" | "manager_override" | "adjustment"
    status: "open" | "closed" | "requires_review"
  } | null
}

export type {
  DashboardClockStatus,
  DashboardShiftOverview,
  DashboardShiftSummary,
}
