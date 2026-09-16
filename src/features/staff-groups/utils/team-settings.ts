import type {
  StaffGroupSettingsEmployee,
  StaffGroupSettingsGroup,
} from "@/features/staff-groups/types"

type TeamStatusFilter = "all" | StaffGroupSettingsEmployee["status"]

function filterTeamEmployees(
  employees: Array<StaffGroupSettingsEmployee>,
  filters: { search: string; status: TeamStatusFilter }
) {
  const normalizedQuery = filters.search.trim().toLowerCase()

  return employees.filter((employee) => {
    const matchesStatus =
      filters.status === "all" || employee.status === filters.status
    const matchesSearch =
      !normalizedQuery ||
      `${employee.name} ${employee.email ?? ""} ${employee.role ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery)

    return matchesStatus && matchesSearch
  })
}

function getTeamSettingsSummary(
  employees: Array<StaffGroupSettingsEmployee>,
  groups: Array<StaffGroupSettingsGroup>
) {
  const activeEmployees = employees.filter(
    (employee) => employee.status === "active"
  ).length

  return {
    activeEmployees,
    groupsInUse: groups.filter((group) => group.employeeCount > 0).length,
    inactiveEmployees: employees.length - activeEmployees,
    totalEmployees: employees.length,
  }
}

export { filterTeamEmployees, getTeamSettingsSummary }
export type { TeamStatusFilter }
