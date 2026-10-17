import type { z } from "zod"
import type {
  ClockShiftSegment,
  ManagerClockEmployee,
} from "@/features/time-clock/types"
import type { OrganizationCapabilities } from "@/lib/auth/workspace-capabilities"
import type { managerDayInputSchema, resolveArrivalSchema } from "./schemas"

type DashboardLocation = {
  id: string
  name: string
  slug: string
  timeZone: string
  timeFormat: "12h" | "24h"
  attendanceEnabled: boolean
  canWrite: boolean
  lateGraceMinutes: number
}
type ManagerDashboardAccess = {
  locations: Array<DashboardLocation>
  capabilities: OrganizationCapabilities
}
type TeamStatus =
  | "scheduled"
  | "upcoming"
  | "working"
  | "finished"
  | "arrival_due"
  | "clock_out_missing"
  | "reviewed"
type TeamRow = {
  key: string
  employeeId: string
  employeeName: string
  isActive: boolean
  workDate: string | null
  zone: string
  rotaId: string | null
  assignmentId: string | null
  shiftId: string | null
  segment: ClockShiftSegment
  startsAt: string | null
  endsAt: string | null
  closesAtEstimate: boolean
  clockedInAt: string | null
  clockedOutAt: string | null
  entryId: string | null
  status: TeamStatus
  notes: string | null
  requiresReview: boolean
  lateMinutes: number
}
type PlanningWeek = {
  weekStart: string
  rotaId: string | null
  status: "draft" | "published" | "not_started"
  hasChanges: boolean
  unfilled: number
}
type ManagerDayData = {
  date: string
  today: string
  isToday: boolean
  updatedAt: string
  location: DashboardLocation
  team: Array<TeamRow>
  clockEmployees: Array<ManagerClockEmployee>
  planning: Array<PlanningWeek>
}
type AttentionKind =
  | "review"
  | "missing_clock_out"
  | "arrival"
  | "swap"
  | "cover"
type AttentionItem = {
  id: string
  kind: AttentionKind
  employeeId: string
  employeeName: string
  locationId: string
  locationName: string
  timeZone: string
  occurredAt: string
  clockedOutAt: string | null
  workDate: string
  reason: string
  segment: ClockShiftSegment
  assignmentId: string | null
}
type AttentionPage = {
  items: Array<AttentionItem>
  total: number
  page: number
  pageSize: number
  updatedAt: string
}
type ManagerDayInput = z.infer<typeof managerDayInputSchema>
type ResolveArrivalInput = z.infer<typeof resolveArrivalSchema>

export type {
  DashboardLocation,
  ManagerDashboardAccess,
  ManagerDayData,
  TeamRow,
  TeamStatus,
  PlanningWeek,
  AttentionItem,
  AttentionPage,
  AttentionKind,
  ManagerDayInput,
  ResolveArrivalInput,
}
