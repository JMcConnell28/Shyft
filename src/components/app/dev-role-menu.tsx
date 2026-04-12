import * as React from "react"
import { FlaskConicalIcon } from "lucide-react"

import type { OrganizationSummary } from "@/lib/onboarding"
import type { DevRoleOverride } from "@/lib/auth/dev-role-override"
import {
  createDevRoleOverrideCookie,
  devRoleOverrideOptions,
} from "@/lib/auth/dev-role-override"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function readCookieValue(cookieName: string) {
  if (typeof document === "undefined") {
    return null
  }

  const prefix = `${cookieName}=`

  for (const cookie of document.cookie.split(";")) {
    const normalizedCookie = cookie.trim()

    if (normalizedCookie.startsWith(prefix)) {
      return decodeURIComponent(normalizedCookie.slice(prefix.length))
    }
  }

  return null
}

function formatRoleLabel(role: DevRoleOverride | "system") {
  if (role === "system") {
    return "Use real role"
  }

  return role.charAt(0).toUpperCase() + role.slice(1)
}

function DevRoleMenu({
  activeOrganization,
}: {
  activeOrganization: OrganizationSummary
}) {
  const cookieName = React.useMemo(
    () => `shyft_dev_role_override_${activeOrganization.id}`,
    [activeOrganization.id],
  )
  const [selectedRole, setSelectedRole] = React.useState<
    DevRoleOverride | "system"
  >("system")

  React.useEffect(() => {
    const cookieValue = readCookieValue(cookieName)
    const nextRole = devRoleOverrideOptions.includes(
      cookieValue as DevRoleOverride,
    )
      ? (cookieValue as DevRoleOverride)
      : "system"

    setSelectedRole(nextRole)
  }, [cookieName])

  const handleRoleChange = React.useCallback(
    (value: string) => {
      const nextRole = value === "system" ? null : (value as DevRoleOverride)

      document.cookie = createDevRoleOverrideCookie(
        activeOrganization.id,
        nextRole,
      )
      setSelectedRole(nextRole ?? "system")
      window.location.reload()
    },
    [activeOrganization.id],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" className="gap-1.5" />}
      >
        <FlaskConicalIcon className="size-3.5" />
        {selectedRole === "system"
          ? "Dev role"
          : `${formatRoleLabel(selectedRole)} override`}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className="min-w-44 rounded-lg"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            Development role override
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleRoleChange("system")}>
            {selectedRole === "system" ? "✓ " : ""}
            {formatRoleLabel("system")}
          </DropdownMenuItem>
          {devRoleOverrideOptions.map((role) => (
            <DropdownMenuItem
              key={role}
              onClick={() => handleRoleChange(role)}
            >
              {selectedRole === role ? "✓ " : ""}
              {formatRoleLabel(role)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { DevRoleMenu }
