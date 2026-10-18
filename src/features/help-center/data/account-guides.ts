import { accountAccessPages } from "./account/access"
import { accountDevicePages } from "./account/devices"
import type { HelpPage } from "@/features/help-center/types"

const accountPages: ReadonlyArray<HelpPage> = [
  ...accountAccessPages,
  ...accountDevicePages,
]

export { accountPages }
