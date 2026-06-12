type ClockAction = "clock_in" | "clock_out"

type ClockEntryStatus = "open" | "closed" | "requires_review"

type ClockSource = "employee_nfc" | "manager_override" | "adjustment"

type ClockShiftSegment = "full" | "split_first" | "split_second"

type GpsCoordinates = {
  latitude: number
  longitude: number
  accuracyMeters: number
}

type ClockShiftSummary = {
  id: string
  dateLabel: string
  segments: Array<{
    endsAt: string
    key: ClockShiftSegment
    label: string
    startsAt: string
    timeLabel: string
  }>
  shiftType: string
  timeLabel: string
  zoneName: string
}

type EmployeeClockPageData = {
  clockLabel: string
  location: {
    id: string
    name: string
    radiusMeters: number
    maxAccuracyMeters: number
    latitude: number | null
    longitude: number | null
  }
  employee: {
    id: string
    name: string
  }
  completedShiftSegments: ClockShiftSegment[]
  openEntry: {
    id: string
    clockedInAt: string
    shiftSegment: ClockShiftSegment
    status: ClockEntryStatus
  } | null
  matchedShift: ClockShiftSummary | null
  nextAction: ClockAction
  isClockingEnabled: boolean
  setupMessage: string | null
}

type ManagerClockEmployee = {
  id: string
  locationId: string
  locationName: string
  name: string
  email: string | null
  isActive: boolean
  openEntry: {
    id: string
    clockedInAt: string
    isForgottenClockOutAlert: boolean
    scheduledEndAt: string | null
    status: ClockEntryStatus
    source: ClockSource
  } | null
}

type ClockAttemptSummary = {
  id: string
  employeeName: string | null
  action: ClockAction | null
  failureReason: string | null
  createdAt: string
  gpsDistanceMeters: number | null
  gpsAccuracyMeters: number | null
}

type ManagerClockPageData = {
  locations: Array<{
    id: string
    name: string
  }>
  employees: Array<ManagerClockEmployee>
  failedAttempts: Array<ClockAttemptSummary>
  reviewEntries: Array<{
    id: string
    employeeName: string
    clockedInAt: string
    clockedOutAt: string | null
    source: ClockSource
  }>
}

type ClockSettingsPageData = {
  locations: Array<{
    id: string
    name: string
    isEnabled: boolean
    latitude: number | null
    longitude: number | null
    radiusMeters: number
    maxAccuracyMeters: number
    timezone: string
    earlyClockInGraceMinutes: number
    earlyStartReviewMinutes: number
    forgottenClockOutAlertMinutes: number
    hardReviewAfterMinutes: number
    lateClockOutGraceMinutes: number
    lateFinishReviewMinutes: number
  }>
}

export type {
  ClockAction,
  ClockAttemptSummary,
  ClockEntryStatus,
  ClockSettingsPageData,
  ClockShiftSummary,
  ClockShiftSegment,
  ClockSource,
  EmployeeClockPageData,
  GpsCoordinates,
  ManagerClockEmployee,
  ManagerClockPageData,
}
