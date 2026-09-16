import type { Settings2Icon } from "lucide-react"

type SettingsRoute =
  | "/w/$workspaceSlug/settings/general"
  | "/w/$workspaceSlug/settings/locations"
  | "/w/$workspaceSlug/settings/clocking"
  | "/w/$workspaceSlug/settings/company"
  | "/w/$workspaceSlug/settings/rota"
  | "/w/$workspaceSlug/settings/team"
  | "/w/$workspaceSlug/settings/billing"

type SettingsNavItem = {
  description: string
  icon: typeof Settings2Icon
  label: string
  organizationOnly?: boolean
  to: SettingsRoute
}

export type { SettingsNavItem, SettingsRoute }
