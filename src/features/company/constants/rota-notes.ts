import type {
  CompanyEmployeeRotaNoteCategory,
  CompanyEmployeeRotaNotePriority,
} from "@/features/company/types"

const employeeRotaNoteCategories: CompanyEmployeeRotaNoteCategory[] = [
  "general",
  "skill",
  "constraint",
  "preference",
  "warning",
]

const employeeRotaNotePriorities: CompanyEmployeeRotaNotePriority[] = [
  "low",
  "normal",
  "high",
]

const employeeRotaNoteCategoryLabels: Record<
  CompanyEmployeeRotaNoteCategory,
  string
> = {
  constraint: "Constraint",
  general: "General",
  preference: "Preference",
  skill: "Skill",
  warning: "Warning",
}

const employeeRotaNotePriorityLabels: Record<
  CompanyEmployeeRotaNotePriority,
  string
> = {
  high: "High",
  low: "Low",
  normal: "Normal",
}

export {
  employeeRotaNoteCategories,
  employeeRotaNoteCategoryLabels,
  employeeRotaNotePriorities,
  employeeRotaNotePriorityLabels,
}
