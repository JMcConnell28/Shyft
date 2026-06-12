import type { NewRotaSource, RotaListSearch, RotaStatus } from "@/lib/rota-schemas"
import type { OrganizationCapabilities } from "@/lib/auth/get-org-capabilities"
import type { OrganizationRole } from "@/lib/auth/permissions"

type MembershipRole = OrganizationRole

type AccessibleRotaLocation = {
  id: string
  name: string
  slug: string
  hasUnreadPublished: boolean
}

type RotaTemplateSummary = {
  id: string
  name: string
  description: string | null
  shiftCount?: number
}

type RotaListItem = {
  id: string
  locationId: string
  locationName: string
  locationSlug: string
  weekStart: string
  weekEnd: string
  weekLabel: string
  status: RotaStatus
  createdBy: string
  publishedBy: string | null
  updatedAt: string
  scheduledHours: number
  scheduledStaffCount: number
  shiftCount: number
  zoneCount: number
  note: string | null
  isUnread: boolean
  hasUnpublishedChanges: boolean
}

type LatestDraftSummary = {
  id: string
  locationSlug: string
  weekStart: string
  weekEnd: string
  weekLabel: string
  updatedAt: string
}

type PreviousPublishedSummary = {
  id: string
  weekStart: string
  weekEnd: string
  weekLabel: string
  publishedAt: string | null
}

type RotaListPageData = {
  orgSlug: string
  organizationId: string
  workspaceType?: "organization" | "location"
  locationWorkspaceSlug?: string
  capabilities: OrganizationCapabilities
  locations: Array<AccessibleRotaLocation>
  selectedLocation: AccessibleRotaLocation | null
  filters: RotaListSearch
  overview: {
    upcomingWeeks: number
    draftRotas: number
    publishedRotas: number
    unreadPublishedRotas: number
  }
  latestDraft: LatestDraftSummary | null
  templates: Array<RotaTemplateSummary>
  rows: Array<RotaListItem>
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
  hasUnreadRotaUpdates: boolean
}

type RotaDetailRecord = {
  id: string
  status: RotaStatus
  note: string | null
  weekStart: string
  weekEnd: string
  weekLabel: string
  createdBy: string
  createdAt: string
  updatedAt: string
  publishedBy: string | null
  publishedAt: string | null
  publishedVersion: number
  publishedByUserId?: string | null
  scheduledHours: number
  scheduledStaffCount: number
  shiftCount: number
  zoneCount: number
  isUnread?: boolean
}

type RotaDetailPageData = {
  orgSlug: string
  organizationId: string
  workspaceType?: "organization" | "location"
  locationWorkspaceSlug?: string
  capabilities: OrganizationCapabilities
  locations: Array<AccessibleRotaLocation>
  selectedLocation: AccessibleRotaLocation
  templates: Array<RotaTemplateSummary>
  previousPublished: PreviousPublishedSummary | null
  weekStart: string
  weekEnd: string
  weekLabel: string
  hasUnreadRotaUpdates: boolean
  mode: "existing" | "empty"
  rota: RotaDetailRecord | null
}

type ExistingRotaPreview = {
  id: string
}

type RotaRouteTarget = {
  orgSlug: string
  locationSlug: string
  rotaId: string
}

type CreateDraftRotaRecordResult = {
  wasExisting: boolean
  target: RotaRouteTarget
}

type PublishRotaVersionResult = {
  notificationEmailError?: string
  notificationEmailCount: number
  target: RotaRouteTarget
}

type CopyRotaBoardMode = "full" | "shifts-only"

type CopyRotaBoardSkippedEmployee = {
  employeeId: string
  employeeName: string
  reason: "missing" | "inactive" | "not-assigned"
}

type CopyRotaBoardResult =
  | {
      status: "success"
      mode: CopyRotaBoardMode
      overwritten: true
      sourceWeekLabel: string
      copiedShiftCount: number
      copiedAssignmentCount: number
      copiedNote: boolean
      skippedEmployees: Array<CopyRotaBoardSkippedEmployee>
    }
  | {
      status: "unavailable"
      mode: CopyRotaBoardMode
      reason: "no-source"
    }

type ExistingRotaRecord = {
  id: string
}

type RotaCreationPreview = {
  existingRota: ExistingRotaPreview | null
  previousPublished: PreviousPublishedSummary | null
  templates: Array<RotaTemplateSummary>
}

type RotaTemplateMutationResult = {
  templateId: string
}

type ApplyRotaTemplateResult = {
  success: true
  shiftCount: number
}

type CreateDraftRotaRecordInput = {
  organizationId: string | null
  userId: string
  locationId: string
  locationSlug: string
  orgSlug: string
  weekStart: string
  sourceType: NewRotaSource | "duplicate"
  templateId?: string | null
}

export type {
  AccessibleRotaLocation,
  ApplyRotaTemplateResult,
  CreateDraftRotaRecordResult,
  CreateDraftRotaRecordInput,
  ExistingRotaRecord,
  ExistingRotaPreview,
  LatestDraftSummary,
  MembershipRole,
  CopyRotaBoardMode,
  CopyRotaBoardResult,
  CopyRotaBoardSkippedEmployee,
  PublishRotaVersionResult,
  PreviousPublishedSummary,
  RotaRouteTarget,
  RotaCreationPreview,
  RotaDetailPageData,
  RotaDetailRecord,
  RotaListItem,
  RotaListPageData,
  RotaTemplateSummary,
  RotaTemplateMutationResult,
}
