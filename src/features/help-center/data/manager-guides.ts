import { managerAttendancePages } from "./managers/attendance"
import { managerClockingSetupPages } from "./managers/clocking-setup"
import { managerCommunicationPages } from "./managers/communication"
import { managerPeoplePages } from "./managers/people"
import { managerPlanningPages } from "./managers/planning"
import { managerRotaPages } from "./managers/rotas"
import { managerSetupPages } from "./managers/setup"
import type { HelpPage } from "@/features/help-center/types"

const managerPages: ReadonlyArray<HelpPage> = [
  ...managerSetupPages,
  ...managerRotaPages,
  ...managerPlanningPages,
  ...managerPeoplePages,
  ...managerClockingSetupPages,
  ...managerAttendancePages,
  ...managerCommunicationPages,
]

export { managerPages }
