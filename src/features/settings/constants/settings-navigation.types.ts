import type { Settings2Icon } from "lucide-react"

type SettingsRoute =
  | "/app/$workspaceSlug/settings/general"
  | "/app/$workspaceSlug/settings/locations"
  | "/app/$workspaceSlug/settings/clocking"
  | "/app/$workspaceSlug/settings/company"
  | "/app/$workspaceSlug/settings/company/join-requests"
  | "/app/$workspaceSlug/settings/rota"
  | "/app/$workspaceSlug/settings/team"
  | "/app/$workspaceSlug/settings/billing"
  | "/app/$workspaceSlug/settings/permissions"

type SettingsNavItem = {
  description: string
  icon: typeof Settings2Icon
  label: string
  requiresCompanyAdmin?: boolean
  requiresJoinApproval?: boolean
  requiresOwner?: boolean
  to: SettingsRoute
}

export type { SettingsNavItem, SettingsRoute }
