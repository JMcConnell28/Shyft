import { getStaffGroupColorAppearance } from "@/features/staff-groups/constants/staff-group-colors"

function getEmployeeGroupAppearance(groupColor: string) {
  const appearance = getStaffGroupColorAppearance(groupColor)

  return {
    cardClassName: appearance.cardClassName,
    dotClassName: appearance.dotClassName,
  }
}

export { getEmployeeGroupAppearance }
