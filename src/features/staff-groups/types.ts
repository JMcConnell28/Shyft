import type { StaffGroupColor } from "@/features/staff-groups/constants/staff-group-colors"

type StaffGroupSettingsGroup = {
  id: string
  name: string
  slug: string
  isFallback: boolean
  employeeCount: number
  color: StaffGroupColor
}

type StaffGroupSettingsEmployee = {
  id: string
  name: string
  email: string | null
  role: string | null
  status: "active" | "inactive"
  groupId: string | null
  compensation:
    | {
        type: "hourly"
        hourlyRatePence: number
      }
    | {
        type: "salary"
        weeklySalaryPence: number
      }
}

type StaffGroupSettingsLocation = {
  id: string
  name: string
}

type EmployeeCompensationInput =
  | {
      type: "hourly"
      hourlyRatePence: number
    }
  | {
      type: "salary"
      weeklySalaryPence: number
    }

type StaffGroupSettingsPageData = {
  groups: Array<StaffGroupSettingsGroup>
  employees: Array<StaffGroupSettingsEmployee>
  locations: Array<StaffGroupSettingsLocation>
  selectedLocationId: string | null
}

export type {
  StaffGroupSettingsEmployee,
  StaffGroupSettingsGroup,
  StaffGroupSettingsLocation,
  StaffGroupSettingsPageData,
  EmployeeCompensationInput,
}
