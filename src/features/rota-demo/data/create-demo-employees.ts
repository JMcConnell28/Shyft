import { demoFirstNames, demoLastNames } from "./demo-employee-names"
import { demoRotaBoardData } from "./demo-rota-board"
import type { WorkspaceEmployee } from "@/features/rota/types/workspace"
import { DEFAULT_MINIMUM_WAGE_PENCE } from "@/features/staff-groups/utils/minimum-wage"

const NAME_SEQUENCE_STEP = 137

export function createDemoEmployees(count: number): Array<WorkspaceEmployee> {
  return Array.from({ length: count }, (_, index) => {
    const existing = demoRotaBoardData.employees.at(index)
    if (existing) return existing

    const generatedIndex = index - demoRotaBoardData.employees.length
    const nameIndex =
      (generatedIndex * NAME_SEQUENCE_STEP) %
      (demoFirstNames.length * demoLastNames.length)
    const firstName = demoFirstNames[nameIndex % demoFirstNames.length]
    const lastName =
      demoLastNames[Math.floor(nameIndex / demoFirstNames.length)]
    const group =
      demoRotaBoardData.employeeGroups[
        index % demoRotaBoardData.employeeGroups.length
      ]

    return {
      id: `demo-employee-${index + 1}`,
      name: `${firstName} ${lastName}`,
      groupId: group.id,
      groupColor: group.color,
      weeklyHours: [16, 20, 24, 30, 35, 40][index % 6],
      compensation:
        group.id === "management"
          ? { type: "salary", weeklySalaryPence: 85000 }
          : { type: "hourly", hourlyRatePence: DEFAULT_MINIMUM_WAGE_PENCE },
    }
  })
}
