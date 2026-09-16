import { describe, expect, it } from "vitest"

import type {
  StaffGroupSettingsEmployee,
  StaffGroupSettingsGroup,
} from "@/features/staff-groups/types"

import {
  filterTeamEmployees,
  getTeamSettingsSummary,
} from "@/features/staff-groups/utils/team-settings"

const employees: Array<StaffGroupSettingsEmployee> = [
  {
    id: "employee-1",
    name: "Emily Brown",
    email: "emily@example.com",
    role: "manager",
    status: "active",
    groupId: "group-1",
    compensation: { type: "hourly", hourlyRatePence: 1200 },
  },
  {
    id: "employee-2",
    name: "Tom Williams",
    email: "tom@example.com",
    role: "employee",
    status: "inactive",
    groupId: null,
    compensation: { type: "salary", weeklySalaryPence: 50_000 },
  },
]

const groups: Array<StaffGroupSettingsGroup> = [
  {
    id: "group-1",
    name: "Management",
    slug: "management",
    isFallback: false,
    employeeCount: 1,
    color: "sky",
  },
  {
    id: "group-2",
    name: "Kitchen",
    slug: "kitchen",
    isFallback: false,
    employeeCount: 0,
    color: "orange",
  },
]

describe("team settings", () => {
  it("filters by name, email, or role", () => {
    expect(
      filterTeamEmployees(employees, { search: "manager", status: "all" })
    ).toEqual([employees[0]])
  })

  it("filters by employee status", () => {
    expect(
      filterTeamEmployees(employees, { search: "", status: "inactive" })
    ).toEqual([employees[1]])
  })

  it("summarizes employees and groups used at the location", () => {
    expect(getTeamSettingsSummary(employees, groups)).toEqual({
      activeEmployees: 1,
      groupsInUse: 1,
      inactiveEmployees: 1,
      totalEmployees: 2,
    })
  })
})
