import { accessTroubleshootingPages } from "./troubleshooting/access"
import { deviceTroubleshootingPages } from "./troubleshooting/devices"
import type { HelpPage } from "@/features/help-center/types"

const troubleshootingPages: ReadonlyArray<HelpPage> = [
  ...accessTroubleshootingPages,
  ...deviceTroubleshootingPages,
]

export { troubleshootingPages }
