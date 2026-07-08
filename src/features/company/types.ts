import type { AssignableOrganizationRole } from "@/lib/auth/permissions"
import type { EmployeeCompensationInput } from "@/features/staff-groups/types"

type CompanyRole = AssignableOrganizationRole | "owner" | "member"

type CompanyEmployeeListItem = {
  id: string
  name: string
  email: string | null
  payrollId: string | null
  role: CompanyRole | null
  status: "active" | "inactive"
  groupName: string | null
  activeLocationCount: number
  locationCount: number
}

type CompanyEmployeeLocation = {
  id: string
  name: string
  isActive: boolean
}

type CompanyEmployeeRotaNoteCategory =
  | "general"
  | "skill"
  | "constraint"
  | "preference"
  | "warning"

type CompanyEmployeeRotaNotePriority = "low" | "normal" | "high"

type CompanyEmployeeRotaNote = {
  id: string
  body: string
  category: CompanyEmployeeRotaNoteCategory
  createdAt: string
  isPinned: boolean
  locationId: string | null
  locationName: string | null
  priority: CompanyEmployeeRotaNotePriority
  title: string
  updatedAt: string
  zoneId: string | null
  zoneName: string | null
}

type CompanyEmployeeRotaNoteFormValues = {
  body: string
  category: CompanyEmployeeRotaNoteCategory
  isPinned: boolean
  locationId: string | null
  priority: CompanyEmployeeRotaNotePriority
  title: string
  zoneId: string | null
}

type CompanyEmployeeNoteLocationOption = {
  id: string
  name: string
}

type CompanyEmployeeNoteZoneOption = {
  id: string
  locationId: string
  name: string
}

type CompanyEmployeeDetail = CompanyEmployeeListItem & {
  compensation: EmployeeCompensationInput
  locations: Array<CompanyEmployeeLocation>
  rotaNoteLocations: Array<CompanyEmployeeNoteLocationOption>
  rotaNotes: Array<CompanyEmployeeRotaNote>
  rotaNoteZones: Array<CompanyEmployeeNoteZoneOption>
  userId: string | null
}

type CompanyEmployeesPageData = {
  employees: Array<CompanyEmployeeListItem>
  workspaceName: string
}

type CompanyEmployeePageData = {
  employee: CompanyEmployeeDetail
  workspaceName: string
}

type CompanyEmployeePayrollUpdate = {
  employeeId: string
  payrollId: string | null
}

export type {
  CompanyEmployeeDetail,
  CompanyEmployeeListItem,
  CompanyEmployeeLocation,
  CompanyEmployeeNoteLocationOption,
  CompanyEmployeeNoteZoneOption,
  CompanyEmployeePayrollUpdate,
  CompanyEmployeePageData,
  CompanyEmployeeRotaNote,
  CompanyEmployeeRotaNoteCategory,
  CompanyEmployeeRotaNoteFormValues,
  CompanyEmployeeRotaNotePriority,
  CompanyEmployeesPageData,
  CompanyRole,
}
