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
  status: "active" | "inactive"
  groupId: string | null
}

type StaffGroupSettingsPageData = {
  groups: Array<StaffGroupSettingsGroup>
  employees: Array<StaffGroupSettingsEmployee>
}

export type {
  StaffGroupSettingsEmployee,
  StaffGroupSettingsGroup,
  StaffGroupSettingsPageData,
}
