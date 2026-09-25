import type { Settings2Icon } from "lucide-react"

type SettingsRoute =
  | "/app/$workspaceSlug/settings/general"
  | "/app/$workspaceSlug/settings/locations"
  | "/app/$workspaceSlug/settings/clocking"
  | "/app/$workspaceSlug/settings/company"
  | "/app/$workspaceSlug/settings/rota"
  | "/app/$workspaceSlug/settings/team"
  | "/app/$workspaceSlug/settings/billing"

type SettingsNavItem = {
  description: string
  icon: typeof Settings2Icon
  label: string
  to: SettingsRoute
}

export type { SettingsNavItem, SettingsRoute }
