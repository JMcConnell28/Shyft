type ClockAction = "clock_in" | "clock_out"

type ClockEntryStatus = "open" | "closed" | "requires_review"

type ClockSource = "employee_nfc" | "manager_override" | "adjustment"

type ClockShiftSegment = "full" | "split_first" | "split_second"

type ClockReason =
  | "asked_early"
  | "asked_late"
  | "covering_shift"
  | "transport_delay"
  | "manager_approved"
  | "other"

type EarlyClockInMode = "scheduled" | "now"

type ClockTagSetupData = {
  id: string
  aesKeyHex: string
  label: string
  lastSeenCounter: number
  publicId: string
}

type AdminClockTagsPageData = {
  locations: Array<{
    id: string
    name: string
    organizationId: string | null
    organizationName: string | null
  }>
  tags: Array<ClockTagSetupData & { locationId: string }>
}

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

type ClockInReviewPrompt = {
  defaultMode: EarlyClockInMode | null
  isReasonRequired: boolean
  kind: "early" | "late" | "none" | "unmatched"
  message: string | null
  scheduledStartAt: string | null
}

type EmployeeClockPageData = {
  clockLabel: string
  scanSessionId: string
  scanExpiresAt: string
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
  completedShiftSegments: Array<ClockShiftSegment>
  openEntry: {
    id: string
    clockedInAt: string
    scheduledEndAt: string | null
    scheduledStartAt: string | null
    shiftSegment: ClockShiftSegment
    status: ClockEntryStatus
  } | null
  matchedShift: ClockShiftSummary | null
  reviewPrompt: ClockInReviewPrompt
  nextAction: ClockAction
  isClockingEnabled: boolean
  setupMessage: string | null
}

type ClockScanPageData =
  | {
      status: "ready"
      clock: EmployeeClockPageData
    }
  | {
      status: "error"
      title: string
      message: string
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

type ManagerClockActivityEntry = {
  id: string
  employeeId: string
  employeeName: string
  locationId: string
  locationName: string
  zoneName: string | null
  clockedInAt: string
  clockedOutAt: string | null
  isForgottenClockOutAlert: boolean
  scheduledEndAt: string | null
  source: ClockSource
  status: ClockEntryStatus
}

type ManagerClockPageData = {
  selectedDate: string
  locations: Array<{
    id: string
    name: string
  }>
  employees: Array<ManagerClockEmployee>
  activityEntries: Array<ManagerClockActivityEntry>
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
    timeAttendanceEnabled: boolean
    timeAttendanceStatus:
      | "legacy_pending"
      | "trialing"
      | "active"
      | "canceling"
      | "canceled"
      | null
    hardwareEntitlementStatus: "available" | "claimed" | "void" | null
    hardwareFulfillmentStatus:
      | "not_requested"
      | "pending"
      | "shipped"
      | "delivered"
      | "failed"
      | null
    latitude: number | null
    longitude: number | null
    radiusMeters: number
    maxAccuracyMeters: number
    timezone: string
    earlyClockInGraceMinutes: number
    earlyStartReviewMinutes: number
    forgottenClockOutAlertMinutes: number
    hardReviewAfterMinutes: number
    lateClockInGraceMinutes: number
    lateClockOutGraceMinutes: number
    lateFinishReviewMinutes: number
    lateStartReviewMinutes: number
    ntagTags: Array<ClockTagSetupData>
  }>
}

export type {
  AdminClockTagsPageData,
  ClockAction,
  ClockAttemptSummary,
  ClockEntryStatus,
  ClockScanPageData,
  ClockSettingsPageData,
  ClockInReviewPrompt,
  ClockReason,
  ClockShiftSummary,
  ClockShiftSegment,
  ClockSource,
  ClockTagSetupData,
  EarlyClockInMode,
  EmployeeClockPageData,
  GpsCoordinates,
  ManagerClockActivityEntry,
  ManagerClockEmployee,
  ManagerClockPageData,
}
