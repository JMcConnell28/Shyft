type ShiftSwapRequestType = "swap" | "cover"

type ShiftSwapRequestStatus =
  | "awaiting_peer"
  | "open"
  | "pending_manager"
  | "approved"
  | "denied"
  | "cancelled"
  | "expired"

type ShiftSwapResponseStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "withdrawn"
  | "approved"
  | "denied"

type ShiftSwapEmployee = {
  id: string
  name: string
  staffGroupId: string | null
  staffGroupName: string
}

type ShiftSwapShift = {
  assignmentId: string
  publishedShiftId: string
  workingShiftId: string | null
  rotaId: string
  locationId: string
  locationName: string
  employeeId: string
  employeeName: string
  staffGroupId: string | null
  staffGroupName: string
  weekLabel: string
  weekStart: string
  date: string
  dateLabel: string
  timeLabel: string
  zoneName: string
  startsAt: string
  cutoffAt: string
  isPastCutoff: boolean
}

type ShiftSwapRotaOption = {
  id: string
  locationId: string
  locationName: string
  weekLabel: string
  weekStart: string
}

type ShiftSwapRequestSummary = {
  id: string
  requestType: ShiftSwapRequestType
  status: ShiftSwapRequestStatus
  sourceShift: ShiftSwapShift
  requester: ShiftSwapEmployee
  targetEmployee: ShiftSwapEmployee | null
  targetShift: ShiftSwapShift | null
  responder: ShiftSwapEmployee | null
  responseId: string | null
  createdAt: string
  cutoffAt: string
  managerNote: string | null
}

type ShiftSwapPageData = {
  canManage: boolean
  rotas: ShiftSwapRotaOption[]
  ownShifts: ShiftSwapShift[]
  swapTargetShifts: ShiftSwapShift[]
  incomingRequests: ShiftSwapRequestSummary[]
  openCoverRequests: ShiftSwapRequestSummary[]
  myRequests: ShiftSwapRequestSummary[]
  managerRequests: ShiftSwapRequestSummary[]
}

export type {
  ShiftSwapEmployee,
  ShiftSwapPageData,
  ShiftSwapRequestStatus,
  ShiftSwapRequestSummary,
  ShiftSwapRequestType,
  ShiftSwapResponseStatus,
  ShiftSwapRotaOption,
  ShiftSwapShift,
}
