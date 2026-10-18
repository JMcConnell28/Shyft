import { employeeAttendancePages } from "./employees/attendance"
import { employeeCommunicationPages } from "./employees/communication"
import { employeeSchedulePages } from "./employees/schedule"
import type { HelpPage } from "@/features/help-center/types"

const employeePages: ReadonlyArray<HelpPage> = [
  ...employeeSchedulePages,
  ...employeeAttendancePages,
  ...employeeCommunicationPages,
]

export { employeePages }
